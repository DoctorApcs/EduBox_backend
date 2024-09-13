import qdrant_client
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core import StorageContext
from llama_index.core.schema import MetadataMode
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.tools import FunctionTool
from src.constants import GlobalConfig 
import logging
from typing import List

class SingleSourceNode:
    index: int
    text: str
    url: str
    chunk_start: int
    chunk_end: int
    
    def __init__(self, index: int, text: str, url: str, chunk_start: int, chunk_end: int):
        self.index = index
        self.text = text
        self.url = url
        self.chunk_start = chunk_start
        self.chunk_end = chunk_end
    
    def __str__(self) -> str:
        return f"Source [{self.index}]: \n{self.text}"
    
    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "text": self.text,
            "url": self.url,
            "chunk_start": self.chunk_start,
            "chunk_end": self.chunk_end
        }

class RetrievalResponses:
    def __init__(self, source_nodes: List[SingleSourceNode]):
        self.source_nodes = source_nodes
        
    def __str__(self) -> str:
        return "\n===============\n".join([str(node) for node in self.source_nodes])

    def to_dict(self) -> dict:
        return [node.to_dict() for node in self.source_nodes]
    
def load_knowledge_base_search_tool(config: dict):
    embedding_service = config.get("embedding_service", "openai")
    
    if embedding_service == "openai":
        embed_model = OpenAIEmbedding(
            model=config.get("embedding_model_name", "text-embedding-3-small"), 
            api_key=GlobalConfig.MODEL.OPENAI_API_KEY
        )
    else:
        raise NotImplementedError()   
    
    if GlobalConfig.MODEL.VECTOR_STORE == "qdrant":
        client = qdrant_client.QdrantClient(url=GlobalConfig.QDRANT_DB_URL)
        vector_store = QdrantVectorStore(client=client, collection_name=config.get("collection_name", "kb_1"))
    else:
        raise NotImplementedError()
    
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context, embed_model=embed_model)
    start_id = 0
    
    def retrieve_knowledge_base(query_str: str):
        
        """
        Useful for answering questions about papers, research. Add paper year if needed.  
        Retrieves papers based on the given query string and optional year.

        Args:
            query_str (str): The query string used to search for papers.
            start_date (str, optional): The start range of retrieve papers. Defaults to "None".
            end_date (str, optional): The end range of retrieve papers. Defaults to today.
            
        Returns:
            list: A list of retrieved papers, each containing the paper link and content.
        """
        retriever = index.as_retriever(
            similarity_top_k=5,
        )
        
        
        retriever_response = retriever.retrieve(query_str)
        logging.info("Retrieval Content: ", [n.node.get_content(metadata_mode=MetadataMode.LLM) for n in retriever_response])
        try: 
            url = retriever_response[0].node.metadata["metadata"]["file_name"]
        except:
            url = ""
        return RetrievalResponses([
            SingleSourceNode(
                index=start_id + i,
                text=n.node.get_content(metadata_mode=MetadataMode.LLM), 
                url=url,
                chunk_start=0,
                chunk_end=0
            )
            for i, n in enumerate(retriever_response)
        ])
    
    return FunctionTool.from_defaults(retrieve_knowledge_base)