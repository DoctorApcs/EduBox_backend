from abc import ABC, abstractmethod
from qdrant_client import QdrantClient
from qdrant_client.http import models
from chromadb import Client as ChromaClient
from typing import Optional, List, Dict, Any

DEFAULT_COLLECTION_NAME = "document_vectors"
DEFAULT_VECTOR_SIZE = 4
DEFAULT_DISTANCE = models.Distance.COSINE

class VectorDB(ABC):
    @abstractmethod
    def initialize(self):
        pass

    @abstractmethod
    def add_vector(self, vector_id, vector, payload):
        pass

    @abstractmethod
    def search_vectors(self, query_vector, filter_condition, limit):
        pass

class QdrantVectorDB:
    def __init__(self,
                 url: str,
                 collection_name: str = DEFAULT_COLLECTION_NAME,
                 distance: str = DEFAULT_DISTANCE):
        self.client = QdrantClient(url)
        self.collection_name = collection_name
        self.distance = distance
        self.is_initialized = False
        self.vector_size: Optional[int] = None

    def _initialize(self, vector_size: int):
        if not self.is_initialized:
            self.vector_size = vector_size
            self.client.recreate_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=self.vector_size, distance=self.distance),
            )
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name="document_chunk_id",
                field_schema=models.PayloadSchemaType.INTEGER
            )
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name="knowledge_base_id",
                field_schema=models.PayloadSchemaType.INTEGER
            )
            self.is_initialized = True

    def add_vector(self, vector_id: int, vector: List[float], payload: Dict[str, Any]):
        if not self.is_initialized:
            self._initialize(len(vector))
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=vector_id,
                    vector=vector,
                    payload=payload
                )
            ]
        )

    def search_vectors(self, query_vector: List[float], filter_condition: tuple, limit: int):
        if not self.is_initialized:
            raise ValueError("The collection has not been initialized. Add a vector first.")
        
        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key=filter_condition[0],
                        match=models.MatchValue(value=filter_condition[1])
                    )
                ]
            ),
            limit=limit
        )
        return search_result

    
    

class ChromaVectorDB(VectorDB):
    def __init__(self, settings):
        self.client = ChromaClient(settings)
        self.collection_name = "document_vectors"

    def initialize(self):
        self.collection = self.client.create_collection(name=self.collection_name)

    def add_vector(self, vector_id, vector, payload):
        self.collection.add(
            ids=[vector_id],
            embeddings=[vector],
            metadatas=[payload]
        )

    def search_vectors(self, query_vector, filter_condition, limit):
        results = self.collection.query(
            query_embeddings=[query_vector],
            n_results=limit,
            where={filter_condition[0]: filter_condition[1]}
        )
        return results