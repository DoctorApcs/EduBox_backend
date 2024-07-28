from fastapi import APIRouter, HTTPException, Depends
from typing import List
from api.models.assistant import AssistantCreate, AssistantResponse, ChatMessage, ChatResponse
from api.services.assistant import AssistantService
from src.dependencies import get_current_user_id
assistant_router = APIRouter()

@assistant_router.post("/", response_model=AssistantResponse)
async def create_assistant(
    assistant: AssistantCreate,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.create_assistant(current_user_id, assistant)

@assistant_router.delete("/{assistant_id}", response_model=dict)
async def delete_assistant(
    assistant_id: int,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    success = assistant_service.delete_assistant(assistant_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assistant not found")
    return {"message": "Assistant deleted successfully"}

@assistant_router.post("/{assistant_id}/chat", response_model=ChatResponse)
async def chat_with_assistant(
    assistant_id: int,
    message: ChatMessage,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.chat_with_assistant(assistant_id, current_user_id, message)