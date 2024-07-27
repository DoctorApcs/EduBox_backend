from fastapi import APIRouter, Request, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
# from .service import AssistantService
from src.document_parser import process_document
from celery.result import AsyncResult

import os
import uuid

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


@router.post("/upload_document/")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Save the file
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process the document asynchronously
        task = process_document.delay(file_path)
        
        return JSONResponse(
            content={
                "message": "File uploaded successfully",
                "file_name": unique_filename,
                "file_path": file_path,
                "task_id": task.id
            },
            status_code=202
        )
    except Exception as e:
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