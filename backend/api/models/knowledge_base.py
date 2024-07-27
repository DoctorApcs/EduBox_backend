from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class KnowledgeBaseCreate(BaseModel):
    name: str
    description: Optional[str] = None

class KnowledgeBaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class KnowledgeBaseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    user_id: int
    created_at: datetime
    updated_at: datetime
    document_count: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)