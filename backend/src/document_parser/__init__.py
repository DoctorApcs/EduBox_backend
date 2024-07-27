import magic
import os
from src.celery import celery
from datetime import datetime
from src.document_parser.readers import PDFReader, DocxReader

# File type detection
def detect_file_type(file_path):
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type

# Celery Tasks
@celery.task
def process_document(file_path: str):
    file_type = detect_file_type(file_path)
    if file_type.startswith('application/pdf'):
        return process_pdf.delay(file_path)
    elif file_type.startswith('application/vnd.openxmlformats-officedocument.wordprocessingml'):
        return process_docx.delay(file_path)
    # elif file_type.startswith('application/vnd.ms-excel') or file_type.startswith('application/vnd.openxmlformats-officedocument.spreadsheetml'):
    #     return process_excel.delay(file_path)
    # elif file_type.startswith('text/csv'):
    #     return process_csv.delay(file_path)
    elif file_type.startswith('video/'):
        return process_video.delay(file_path)
    else:
        return process_generic.delay(file_path)

@celery.task
def process_pdf(file_path: str):
    print(f"Processing PDF: {file_path}")
    pdf_reader = PDFReader(return_full_document=True)
    pdf_docs = pdf_reader.load_data(file_path)
    
    return {
        "file_type": "PDF",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "pages": len(pdf_docs),
        "text_content": "\n".join([doc['text'] for doc in pdf_docs])
    }

@celery.task
def process_docx(file_path: str):
    print(f"Processing DOCX: {file_path}")
    docx_reader = DocxReader()
    docx_docs = docx_reader.load_data(file_path)
    
    return {
        "file_type": "DOCX",
        "file_path": file_path,
        "processed_at": datetime.now().isoformat(),
        "text_content": "\n".join([doc['text'] for doc in docx_docs])
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