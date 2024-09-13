import os
from config.config import get_config
from dotenv import load_dotenv

load_dotenv(override=True)

cfg = get_config('config/config.yaml')


SERVICE = cfg.MODEL.SERVICE
TEMPERATURE = cfg.MODEL.TEMPERATURE
MODEL_ID = cfg.MODEL.MODEL_ID


# Embeddings
EMBEDDING_SERVICE = cfg.MODEL.EMBEDDING_SERVICE
EMBEDDING_MODEL_NAME = cfg.MODEL.EMBEDDING_MODEL_NAME 


class ModelConfig: 
    VECTOR_STORE = cfg.MODEL.VECTOR_STORE
    SERVICE = SERVICE
    TEMPERATURE = TEMPERATURE
    MODEL_ID = MODEL_ID
    EMBEDDING_SERVICE = EMBEDDING_SERVICE
    EMBEDDING_MODEL_NAME = EMBEDDING_MODEL_NAME
    OTHER_KWARGS = cfg
    
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    FAST_LLM_MODEL = os.environ.get('FAST_LLM_MODEL', "gpt-4o-mini")
    SMART_LLM_MODEL = os.environ.get('SMART_LLM_MODEL', "gpt-4o-mini")
    
    DEFAULT_GUIDELINES = [
        "Each course section MUST be detailed and comprehensive, providing in-depth explanations of the topic.",
        "Include clear citations for all sources using hyperlinks within the text.",
        "Incorporate relevant images to illustrate key concepts. Provide descriptions for each image in [square brackets].",
        "Include at least one relevant video link per section to demonstrate the topic. Describe the video content briefly.",
        "Use bullet points or numbered lists to break down complex information when appropriate.",
        "Ensure a logical flow of information within each section, starting with basic concepts and progressing to more advanced ideas.",
        "Conclude each section with a brief summary or key takeaways.",
        "If a subsection lacks sufficient supporting sources or content, merge it with the previous section or remove it entirely.",
        "Use appropriate headings and subheadings to organize the content hierarchically.",
        "Include practical examples or case studies to reinforce theoretical concepts.",
    ]
    
class GlobalConfig:
    MODEL = ModelConfig
    DATABASE_PATH = "./DB/knowledge_base.db"
    ALLOWED_EXTENSIONS = {'.docx', '.hwp','.pdf','.epub','.txt','.html','.htm','.ipynb','.md', '.mbox', '.pptx', '.csv', '.xml', '.rtf', '.mp4'}
    MAX_CONCURRENT_REQUESTS = 5
    
    UPLOAD_FOLDER = "./uploads"
    END_TOKEN = "<END>"
    
    # logging configuration variable
    FILENAME = os.getenv("LOG_FILENAME", "knowledge_base_app.log")
    FORMATTER = "%(asctime)s.%(msecs)03d - %(thread)d - %(name)s - %(levelname)s - %(message)s"
    ROTATION = "midnight"
    LOG_LEVEL = "INFO"
    
    # config fastapi  
    CORS_ORIGIN = os.getenv("FASTAPI_ORIGINS", "*")
    CORS_METHOD = os.getenv("FASTAPI_METHODS", "*")
    CORS_HEADER = os.getenv("FASTAPI_HEADERS", "*")
    NUM_WORKERS = int(os.getenv("FASTAPI_WORKER", 1))

    # fastapi server
    SERVER_HOST = os.getenv("FASTAPI_HOST", "0.0.0.0")
    SERVER_PORT = int(os.getenv("FASTAPI_PORT", 8000))

    # celery 
    CELERY_QUEUE_NAME = os.environ.get("QUEUE_NAME", "default")
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_BACKEND_URL = os.getenv("CELERY_BACKEND_URL", "redis://localhost:6379/0")
    
    # VectorDB
    QDRANT_DB_URL = os.getenv("QDRANT_DB_URL", "http://localhost:6333") 
