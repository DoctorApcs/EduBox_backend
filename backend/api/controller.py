from fastapi import APIRouter, Request, File, UploadFile
from fastapi.responses import JSONResponse
from .service import AssistantService
from src.document_parser import process_document
import os
import uuid

router = APIRouter()
assistant = AssistantService()


# --- API Endpoints ---

@router.post("/complete")
async def complete_text(request: Request):
    data = await request.json()
    message = data.get("message")
    response = assistant.predict(message)
    return response


@router.post("/upload_document/")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Save the file
        file_path = f"uploads/{unique_filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process the document asynchronously
        task = process_document.delay(file_path)
        
        return JSONResponse(content={
            "message": "File uploaded successfully",
            "file_path": file_path,
            "task_id": task.id
        }, status_code=202)
    except Exception as e:
        return JSONResponse(content={
            "message": f"An error occurred: {str(e)}"
        }, status_code=500)