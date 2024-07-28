from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict
from datetime import datetime

class AssistantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    knowledge_base_id: int
    configuration: Dict[str, str]

class AssistantResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    knowledge_base_id: int
    configuration: Dict[str, str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatMessage(BaseModel):
    content: str

class ChatResponse(BaseModel):
    assistant_message: str