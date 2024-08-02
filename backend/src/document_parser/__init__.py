import magic
import os
from src.celery import celery
from datetime import datetime
from llama_index.core.text_splitter import SentenceSplitter
from src.document_parser.readers import PDFReader, DocxReader
from src.document_parser.embedding import get_embedding
from src.database.manager import DatabaseManager
from src.database.models import DocumentStatus
from src.dependencies import get_database_manager

# Mapping of file extensions to their corresponding reader classes
file_extractor = {
    '.pdf': PDFReader,
    '.docx': DocxReader
}

# Function to determine the file extension based on MIME type
def get_file_extension(file_type):
    if file_type.startswith('application/pdf'):
        return '.pdf'
    elif file_type.startswith('application/vnd.openxmlformats-officedocument.wordprocessingml'):
        return '.docx'
    elif file_type.startswith('video/'):
        return 'video'
    else:
        return 'generic'

# File type detection
def detect_file_type(file_path):
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type

# Celery Tasks
@celery.task(bind=True)
def process_document(self, file_path: str, document_id: int, db_manager: DatabaseManager = get_database_manager()):
    try:
        db_manager.update_document_status(document_id, DocumentStatus.PROCESSING)
        
        file_type = detect_file_type(file_path)
        file_extension = get_file_extension(file_type)
        
        if file_extension in file_extractor:
            result = process_file(file_path, file_extension)
        elif file_extension == 'video':
            result = process_video(file_path)
        else:
            result = process_generic(file_path)
        
        chunks = result['content']
        total_chunks = len(chunks)
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1} of {total_chunks}")
            # Add document chunk to database and vector store
            db_manager.add_document_chunk(
                document_id=document_id,
                chunk_index=i,
                content=chunk,
                vector=get_embedding(chunk)
            )
            
            # Update progress
            self.update_state(state='PROGRESS',
                              meta={'current': i + 1, 'total': total_chunks})
        
        # Update document status to processed
        db_manager.update_document_status(document_id, DocumentStatus.PROCESSED)
        
        return {"status": "success", "message": "Document processed successfully", "total_chunks": total_chunks}
    except Exception as e:
        # Update document status to failed
        db_manager.update_document_status(document_id, DocumentStatus.FAILED)
        raise e

def process_file(file_path: str, file_extension: str):
    # Dynamically select the appropriate reader class
    reader_class = file_extractor[file_extension]
    reader = reader_class(return_full_document=True)
    docs = reader.load_data(file_path)
    
    splitter = SentenceSplitter()
    chunks = splitter.split_text("\n".join([doc['text'] for doc in docs]))
    
    return {
        "file_type": file_extension.upper().replace('.', ''),
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "chunks": len(chunks),
        "content": chunks
    }

@celery.task
def process_video(file_path: str):
    print(f"Processing Video: {file_path}")
    return {
        "file_type": "Video",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "duration": "00:05:30",  # Simulated duration
        "resolution": "1920x1080"  # Simulated resolution
    }

@celery.task
def process_generic(file_path: str):
    print(f"Processing Generic File: {file_path}")
    return {
        "file_type": "Generic",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "file_size": os.path.getsize(file_path),
        "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
    }
