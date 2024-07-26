from models import Base, User, KnowledgeBase, Document, DocumentChunk, Assistant, Conversation, Message
from qdrant_client.models import VectorParams, PayloadSchemaType, Distance, PointStruct
from qdrant_client import QdrantClient, models
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

VECTOR_SIZE = 4

# Database manager class
class DatabaseManager:
    def __init__(self, db_path, qdrant_url):
        self.engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.qdrant_client = QdrantClient(qdrant_url)
        
        # Ensure Qdrant collection exists
        self.qdrant_client.recreate_collection(
            collection_name="document_vectors",
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

        # Define payload schema separately
        self.qdrant_client.create_payload_index(
            collection_name="document_vectors",
            field_name="document_chunk_id",
            field_schema=PayloadSchemaType.INTEGER
        )
        self.qdrant_client.create_payload_index(
            collection_name="document_vectors",
            field_name="knowledge_base_id",
            field_schema=PayloadSchemaType.INTEGER
        )

    def create_user(self, username, email, password_hash):
        with self.Session() as session:
            user = User(username=username, email=email, password_hash=password_hash)
            session.add(user)
            session.commit()
            return user.id

    def create_knowledge_base(self, user_id, name, description):
        with self.Session() as session:
            kb = KnowledgeBase(user_id=user_id, name=name, description=description)
            session.add(kb)
            session.commit()
            return kb.id

    def add_document(self, knowledge_base_id, file_name, file_type, file_path):
        with self.Session() as session:
            doc = Document(knowledge_base_id=knowledge_base_id, file_name=file_name,
                           file_type=file_type, file_path=file_path)
            session.add(doc)
            session.commit()
            return doc.id

    def add_document_chunk(self, document_id, chunk_index, content, vector):
        vector_id = str(uuid.uuid4())
        with self.Session() as session:
            document = session.query(Document).filter_by(id=document_id).first()
            if not document:
                raise ValueError("Document not found")
            
            knowledge_base_id = document.knowledge_base_id
            
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=chunk_index,
                content=content, 
                vector_id=vector_id
            )
            session.add(chunk)
            session.commit()
            
            # Add vector to Qdrant
            self.qdrant_client.upsert(
                collection_name="document_vectors",
                points=[
                    models.PointStruct(
                        id=vector_id,
                        vector=vector,
                        payload={
                            "document_chunk_id": chunk.id,
                            "knowledge_base_id": knowledge_base_id,
                            "content": content
                        }
                    )
                ]
            )
            return chunk.id


    def create_assistant(self, user_id, name, description, knowledge_base_id, configuration):
        with self.Session() as session:
            assistant = Assistant(user_id=user_id, name=name, description=description,
                                  knowledge_base_id=knowledge_base_id, configuration=configuration)
            session.add(assistant)
            session.commit()
            return assistant.id

    def start_conversation(self, user_id, assistant_id):
        with self.Session() as session:
            conv = Conversation(user_id=user_id, assistant_id=assistant_id)
            session.add(conv)
            session.commit()
            return conv.id

    def add_message(self, conversation_id, sender_type, content):
        with self.Session() as session:
            message = Message(conversation_id=conversation_id, sender_type=sender_type, content=content)
            session.add(message)
            session.commit()
            return message.id
    
    
    def search_similar_chunks(self, query_vector, knowledge_base_id, limit=5):
        search_result = self.qdrant_client.search(
            collection_name="document_vectors",
            query_vector=query_vector,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="knowledge_base_id",
                        match=models.MatchValue(value=knowledge_base_id)
                    )
                ]
            ),
            limit=limit
        )
        return [(hit.payload["document_chunk_id"], hit.payload["content"]) for hit in search_result]


# Usage example
if __name__ == "__main__":
    db_manager = DatabaseManager("knowledge_base.db", "http://localhost:6333")
    
    # Create a user
    user_id = db_manager.create_user("john_doe", "john@example.com", "hashed_password")
    
    # Create a knowledge base
    kb_id = db_manager.create_knowledge_base(user_id, "General Knowledge", "A broad knowledge base")
    
    # Add a document
    doc_id = db_manager.add_document(kb_id, "sample.txt", "text/plain", "/path/to/sample.txt")
    
    # Add a document chunk (you'd typically do this after processing the document)
    chunk_id = db_manager.add_document_chunk(doc_id, 0, "This is a sample text", [0.1, 0.2, 0.3, 0.4])  # Simplified vector
    
    # Create an assistant
    assistant_id = db_manager.create_assistant(user_id, "General Assistant", "A helpful AI assistant",
                                               kb_id, {"model": "gpt-3.5-turbo"})
    
    # Start a conversation
    conv_id = db_manager.start_conversation(user_id, assistant_id)
    
    # Add messages to the conversation
    db_manager.add_message(conv_id, "user", "Hello, can you help me?")
    db_manager.add_message(conv_id, "assistant", "Of course! How can I assist you today?")
    
    # Search for similar chunks (you'd typically do this when processing a user query)
    similar_chunks = db_manager.search_similar_chunks([0.15, 0.25, 0.35, 0.45], kb_id)  # Simplified query vector
    print("Similar chunks:", similar_chunks)