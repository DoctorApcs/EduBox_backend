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

router = APIRouter()
UPLOAD_DIR = "uploads"

# assistant = AssistantService()


# --- API Endpoints ---
# @router.post("/complete")
# async def complete_text(request: Request):
#     data = await request.json()
#     message = data.get("message")
#     response = assistant.predict(message)
#     return response

def get_current_user_id(db_manager: DatabaseManager = Depends(get_db_manager)):
    return db_manager.get_current_user_id()

def get_knowledge_base_id(
    knowledge_base_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db_manager: DatabaseManager = Depends(get_db_manager)
):
    kb = db_manager.get_knowledge_base(knowledge_base_id, current_user_id)
    return kb.id


@router.post("/upload_document/")
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

@router.get("/task_status/{task_id}")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id)
    if task_result.ready():
        if task_result.successful():
            return JSONResponse(
                content={
                    "status": "completed",
                    "result": task_result.result
                }
            )
        else:
            return JSONResponse(
                content={
                    "status": "failed",
                    "error": str(task_result.result)
                },
                status_code=500
            )
    else:
        return JSONResponse(
            content={
                "status": "in_progress"
            }
        )