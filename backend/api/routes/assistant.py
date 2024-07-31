from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from api.models.assistant import AssistantCreate, AssistantResponse, ChatMessage, ChatResponse, ConversationResponse, MessageResponse
from api.services.assistant import AssistantService
from src.dependencies import get_current_user_id

assistant_router = APIRouter()

## Assistant ##
@assistant_router.post("/", response_model=AssistantResponse)
async def create_assistant(
    assistant: AssistantCreate,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.create_assistant(current_user_id, assistant)

@assistant_router.get("/", response_model=List[AssistantResponse])
async def get_all_assistants(
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.get_all_assistants(current_user_id)

@assistant_router.get("/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: int,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    assistant = assistant_service.get_assistant(assistant_id, current_user_id)
    if assistant is None:
        raise HTTPException(status_code=404, detail="Assistant not found")
    return assistant

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


### Conversations ###
@assistant_router.get("/{assistant_id}/conversations", response_model=List[ConversationResponse])
async def get_assistant_conversations(
    assistant_id: int,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    conversations = assistant_service.get_assistant_conversations(assistant_id, current_user_id)
    if conversations is None:
        raise HTTPException(status_code=404, detail="Assistant not found")
    return conversations

@assistant_router.post("/{assistant_id}/conversations", response_model=ConversationResponse)
async def create_conversation(
    assistant_id: int,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.create_conversation(current_user_id, assistant_id)

@assistant_router.post("/{assistant_id}/conversations/{conversation_id}/chat", response_model=ChatResponse)
async def chat_with_assistant(
    assistant_id: int,
    conversation_id: int,
    message: ChatMessage,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.chat_with_assistant(conversation_id, current_user_id, message)

@assistant_router.get("/{assistant_id}/conversations/{conversation_id}/history", response_model=List[MessageResponse])
async def get_conversation_history(
    assistant_id: int,
    conversation_id: int,
    current_user_id: int = Depends(get_current_user_id),
    assistant_service: AssistantService = Depends()
):
    return assistant_service.get_conversation_history(conversation_id, current_user_id)