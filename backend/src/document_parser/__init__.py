import os
import magic
from abc import ABC, abstractmethod
from typing import Dict, List, Type
from src.celery import celery
from datetime import datetime
from llama_index.core.text_splitter import SentenceSplitter
import src.document_parser.readers as readers
from src.document_parser.embedding import get_embedding
from src.database.manager import DatabaseManager
from src.database.models import DocumentStatus
from src.dependencies import get_database_manager

class FileProcessor(ABC):
    @abstractmethod
    def process(self, file_path: str) -> Dict:
        pass

class TextFileProcessor(FileProcessor):
    def __init__(self, reader_class):
        self.reader_class = reader_class

    def process(self, file_path: str) -> Dict:
        reader = self.reader_class(return_full_document=True)
        docs = reader.load_data(file_path)
        
        splitter = SentenceSplitter()
        chunks = splitter.split_text("\n".join([doc['text'] for doc in docs]))
        
        return {
            "file_type": self.reader_class.__name__.replace('Reader', ''),
            "file_path": file_path,
            "processed_at": datetime.now().isoformat(),
            "chunks": len(chunks),
            "content": chunks
        }

def create_processor_class(reader_class):
    class DynamicProcessor(TextFileProcessor):
        def __init__(self):
            super().__init__(reader_class)
    
    return DynamicProcessor

class FileProcessorFactory:
    _processors: Dict[str, Type[FileProcessor]] = {}
    _file_extensions: Dict[str, str] = {
        '.docx': 'Docx',
        '.hwp': 'HWP',
        '.pdf': 'PDF',
        '.epub': 'Epub',
        '.txt': 'Flat',
        '.html': 'HTMLTag',
        '.htm': 'HTMLTag',
        '.ipynb': 'IPYNB',
        '.md': 'Markdown',
        '.mbox': 'Mbox',
        '.pptx': 'Pptx',
        '.csv': 'CSV',
        '.xml': 'XML',
        '.rtf': 'RTF',
    }

    @classmethod
    def initialize(cls):
        for ext, reader_name in cls._file_extensions.items():
            reader_class = getattr(readers, f"{reader_name}Reader", None)
            if reader_class:
                processor_class = create_processor_class(reader_class)
                cls._processors[ext] = processor_class

    @classmethod
    def get_processor(cls, file_path: str) -> FileProcessor:
        if not cls._processors:
            cls.initialize()

        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension in cls._processors:
            return cls._processors[file_extension]()
        
        # If extension is not recognized, use MIME type detection
        mime_type = cls.detect_mime_type(file_path)
        file_type = cls.mime_to_file_type(mime_type)
        
        processor_class = cls._processors.get(file_type, create_processor_class(readers.FlatReader))
        return processor_class()

    @classmethod
    def register_processor(cls, file_extension: str, reader_class):
        processor_class = create_processor_class(reader_class)
        cls._processors[file_extension] = processor_class

    @staticmethod
    def detect_mime_type(file_path: str) -> str:
        mime = magic.Magic(mime=True)
        return mime.from_file(file_path)

    @staticmethod
    def mime_to_file_type(mime_type: str) -> str:
        mime_to_type = {
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'application/vnd.ms-powerpoint': '.ppt',
            'application/epub+zip': '.epub',
            'text/plain': '.txt',
            'text/html': '.html',
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'application/x-ipynb+json': '.ipynb',
            'text/markdown': '.md',
            'application/mbox': '.mbox',
            'text/csv': '.csv',
            'video/mp4': '.mp4',
            'audio/mpeg': '.mp3',
            'application/xml': '.xml',
            'text/rtf': '.rtf',
            # Add more mappings as needed
        }
        return mime_to_type.get(mime_type, '.txt')  # Default to .txt for unstructured

@celery.task(bind=True)
def process_document(self, file_path: str, document_id: int, db_manager: DatabaseManager = get_database_manager()):
    try:
        db_manager.update_document_status(document_id, DocumentStatus.PROCESSING)
        
        processor = FileProcessorFactory.get_processor(file_path)
        result = processor.process(file_path)
        
        chunks = result.get('content', [])
        total_chunks = len(chunks)
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1} of {total_chunks}")
            db_manager.add_document_chunk(
                document_id=document_id,
                chunk_index=i,
                content=chunk,
                vector=get_embedding(chunk)
            )
            
            self.update_state(state='PROGRESS',
                              meta={'current': i + 1, 'total': total_chunks})
        
        db_manager.update_document_status(document_id, DocumentStatus.PROCESSED)
        
        return {"status": "success", "message": "Document processed successfully", "total_chunks": total_chunks}
    except Exception as e:
        db_manager.update_document_status(document_id, DocumentStatus.FAILED)
        raise e