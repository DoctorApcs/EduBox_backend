from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
# from .service import AssistantService
from src.document_parser import process_document
from celery.result import AsyncResult
from fastapi import Depends
import os
import uuid
from src.dependencies import get_db_manager
from src.database.manager import DatabaseManager
from api.models.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseResponse, KnowledgeBaseUpdate
from typing import List

kb_router = APIRouter()
UPLOAD_DIR = "uploads"

# assistant = AssistantService()


# --- API Endpoints ---
def get_current_user_id(db_manager: DatabaseManager = Depends(get_db_manager)):
    return db_manager.get_current_user_id()

def get_knowledge_base_id(
    knowledge_base_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    kb = db_manager.get_knowledge_base(knowledge_base_id, current_user_id)
    return kb.id


@kb_router.post("/upload_document")
async def upload_document(
    file: UploadFile = File(...),
    knowledge_base_id: int = Depends(get_knowledge_base_id),
    db_manager : DatabaseManager = Depends(get_db_manager)
):
    try:
                
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Save the file
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Add document to database
        document_id = db_manager.add_document(
            knowledge_base_id=knowledge_base_id,
            file_name=unique_filename,
            file_type=file_extension,
            file_path=file_path
        )
        
        # Process the document asynchronously
        task = process_document.delay(file_path, document_id)
        
        return JSONResponse(
            content={
                "message": "File uploaded successfully",
                "file_name": unique_filename,
                "file_path": file_path,
                "document_id": document_id,
                "task_id": task.id
            },
            status_code=202
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
        
        
@kb_router.post("/", response_model=KnowledgeBaseResponse)
async def create_knowledge_base(
    kb: KnowledgeBaseCreate,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    try:
        kb_id = db_manager.create_knowledge_base(current_user_id, kb.name, kb.description)
        return KnowledgeBaseResponse(id=kb_id, name=kb.name, description=kb.description, user_id=current_user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@kb_router.get("/{kb_id}", response_model=KnowledgeBaseResponse)
async def read_knowledge_base(
    kb_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    kb = db_manager.get_knowledge_base(kb_id, current_user_id)
    if kb is None:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return KnowledgeBaseResponse(id=kb.id, name=kb.name, description=kb.description, user_id=kb.user_id)

@kb_router.get("/", response_model=List[KnowledgeBaseResponse])
async def list_knowledge_bases(
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    kbs = db_manager.list_knowledge_bases(current_user_id)
    return [KnowledgeBaseResponse(id=kb.id, name=kb.name, description=kb.description, user_id=kb.user_id) for kb in kbs]

@kb_router.put("/{kb_id}", response_model=KnowledgeBaseResponse)
async def update_knowledge_base(
    kb_id: int,
    kb_update: KnowledgeBaseUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    updated_kb = db_manager.update_knowledge_base(kb_id, current_user_id, kb_update.name, kb_update.description)
    if updated_kb is None:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return KnowledgeBaseResponse(id=updated_kb.id, name=updated_kb.name, description=updated_kb.description, user_id=updated_kb.user_id)

@kb_router.delete("/{kb_id}", response_model=dict)
async def delete_knowledge_base(
    kb_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    success = db_manager.delete_knowledge_base(kb_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return {"message": "Knowledge base deleted successfully"}