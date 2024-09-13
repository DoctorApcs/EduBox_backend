from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Optional
from datetime import datetime
from typing import List
from src.constants import GlobalConfig

class DocumentInKnowledgeBase(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_path: str
    created_at: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


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
    documents: List[DocumentInKnowledgeBase]
    background_image: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class CourseGenerationRequest(BaseModel):
    query: str
    max_sections: int = Field(default=3, ge=1)
    publish_formats: Dict[str, bool] = Field(
        default_factory=lambda: {"markdown": True, "pdf": False, "docx": False}
    )
    include_human_feedback: bool = False
    follow_guidelines: bool = False
    model: str = "gpt-4o-mini"
    guidelines: Optional[List[str]] = GlobalConfig.MODEL.DEFAULT_GUIDELINES
    verbose: bool = False


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)