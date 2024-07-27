import magic
import os
from src.celery import celery
from datetime import datetime
from llama_index.core.text_splitter import SentenceSplitter
from src.document_parser.readers import PDFReader, DocxReader
from src.document_parser.embedding import get_embedding
from src.database.manager import DatabaseManager
from src.dependencies import get_database_manager


# File type detection
def detect_file_type(file_path):
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type

# Celery Tasks
@celery.task
def process_document(file_path: str, document_id: int, db_manager : DatabaseManager = get_database_manager()):
    try:
        
        file_type = detect_file_type(file_path)
        if file_type.startswith('application/pdf'):
            result = process_pdf(file_path)
        elif file_type.startswith('application/vnd.openxmlformats-officedocument.wordprocessingml'):
            result = process_docx(file_path)
        elif file_type.startswith('video/'):
            result = process_video(file_path)
        else:
            result = process_generic(file_path)
        
        chunks = result['content']
        
        for i, chunk in enumerate(chunks):
            # Add document chunk to database and vector store
            db_manager.add_document_chunk(
                document_id=document_id,
                chunk_index=i,
                content=chunk,
                vector=get_embedding(chunk)
            )
        
        
        # Update document status to processed
        # Note: You might need to add a method to DatabaseManager to update document status
        # db_manager.update_document_status(document_id, "processed")
        
        return {"status": "success", "message": "Document processed successfully"}
    except Exception as e:
        # Update document status to failed
        # db_manager.update_document_status(document_id, "failed")
        return {"status": "error", "message": str(e)}

@celery.task
def process_pdf(file_path: str):
    print(f"Processing PDF: {file_path}")
    pdf_reader = PDFReader(return_full_document=True)
    pdf_docs = pdf_reader.load_data(file_path)
    
    splitter = SentenceSplitter()
    chunks = splitter.split_text("\n".join([doc['text'] for doc in pdf_docs]))
    
    
    return {
        "file_type": "PDF",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "chunks": len(chunks),
        "content": chunks
    }

@celery.task
def process_docx(file_path: str):
    print(f"Processing DOCX: {file_path}")
    docx_reader = DocxReader()
    docx_docs = docx_reader.load_data(file_path)
    
    splitter = SentenceSplitter()
    chunks = splitter.split_text("\n".join([doc['text'] for doc in docx_docs]))
    
    return {
        "file_type": "DOCX",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "chunks": len(chunks),
        "content": chunks
    }

# @celery.task
# def process_excel(file_path: str):
#     print(f"Processing Excel: {file_path}")
#     return {
#         "file_type": "Excel",
#         "file_path": file_path,
#         "processed_at": datetime.now().isoformat(),
#         "sheets": 3,  # Simulated number of sheets
#         "total_rows": 500  # Simulated total number of rows
#     }

# @celery.task
# def process_csv(file_path: str):
#     print(f"Processing CSV: {file_path}")
#     return {
#         "file_type": "CSV",
#         "file_path": file_path,
#         "processed_at": datetime.now().isoformat(),
#         "rows": 1000,  # Simulated number of rows
#         "columns": 10  # Simulated number of columns
#     }

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