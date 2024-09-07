import base64
import json
from fastapi import WebSocket
from typing import Dict, Any, Optional
from src.constants import GlobalConfig
from enum import Enum
from api.models.knowledge_base import CourseGenerationRequest
from api.services.knowledge_base import KnowledgeBaseService
from fastapi import WebSocketDisconnect
from src.utils.stream import stream_output
from src.agents.course_agent import CourseAgent


class MediaType(str, Enum):
    TEXT = "text"
    VIDEO = "video"
    AUDIO = "audio"
    IMAGE = "image"


class MessageType(str, Enum):
    MESSAGE = "message"
    STATUS = "status"
    ERROR = "error"
    END = "end"


class EndStatus(str, Enum):
    COMPLETE = "complete"
    INTERRUPTED = "interrupted"
    ERROR = "error"
    TIMEOUT = "timeout"


class Message:
    def __init__(
        self,
        message_type: MessageType,
        media_type: MediaType,
        content: Any,
        metadata: Dict[str, Any],
    ):
        self.message_type = message_type
        self.media_type = media_type
        self.content = content
        self.metadata = metadata

    def to_dict(self):
        payload = {
            "type": self.message_type,
            "media_type": self.media_type,
            "metadata": self.metadata,
        }

        if isinstance(self.content, bytes):
            payload["content"] = base64.b64encode(self.content).decode("utf-8")
        else:
            payload["content"] = self.content

        return payload


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[id(websocket)] = websocket

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(id(websocket), None)

    async def send_chat_message(self, websocket: WebSocket, message: Message):
        await websocket.send_json(message.to_dict())

    async def send_text_message(
        self,
        websocket: WebSocket,
        text: str,
        sender_type: str = "assistant",
        extra_metadata: Optional[Dict[str, Any]] = None,
    ):
        metadata = {"sender_type": sender_type, **(extra_metadata or {})}
        message = Message(
            message_type=MessageType.MESSAGE,
            media_type=MediaType.TEXT,
            content=text,
            metadata=metadata,
        )
        await self.send_chat_message(websocket, message)

    async def send_media_chunk(
        self,
        websocket: WebSocket,
        media_type: MediaType,
        chunk: bytes,
        chunk_metadata: Dict[str, Any],
    ):
        message = Message(
            message_type=MessageType.MESSAGE,
            media_type=media_type,
            content=chunk,
            metadata=chunk_metadata,
        )
        await self.send_chat_message(websocket, message)

    async def send_status(
        self,
        websocket: WebSocket,
        status: str,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ):
        metadata = {"status": status, **(extra_metadata or {})}
        message = Message(
            message_type=MessageType.STATUS,
            media_type=MediaType.TEXT,
            content=status,
            metadata=metadata,
        )
        await self.send_chat_message(websocket, message)

    async def send_error(
        self,
        websocket: WebSocket,
        error_message: str,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ):
        metadata = {"error": error_message, **(extra_metadata or {})}
        message = Message(
            message_type=MessageType.ERROR,
            media_type=MediaType.TEXT,
            content=error_message,
            metadata=metadata,
        )
        await self.send_chat_message(websocket, message)

    async def send_end_message(
        self,
        websocket: WebSocket,
        media_type: MediaType,
        end_status: EndStatus,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ):
        metadata = {
            "end_token": GlobalConfig.END_TOKEN,
            "end_status": end_status,
            **(extra_metadata or {}),
        }
        message = Message(
            message_type=MessageType.END,
            media_type=media_type,
            content=f"{media_type}_end",
            metadata=metadata,
        )
        await self.send_chat_message(websocket, message)

    async def handle_course_generation(
        self,
        websocket: WebSocket,
        kb_id: int,
        current_user_id: int,
        kb_service: KnowledgeBaseService,
    ):
        try:
            # Receive the CourseGenerationRequest as a JSON string
            request_data = await websocket.receive_text()
            request = CourseGenerationRequest(**json.loads(request_data))

            # Verify that the knowledge base exists and belongs to the current user
            kb = kb_service.get_knowledge_base(kb_id, current_user_id)
            if kb is None:
                await self.send_error(websocket, "Knowledge base not found")
                return

            # Create a task dictionary from the request
            task = {
                "query": request.query,
                "max_sections": request.max_sections,
                "publish_formats": request.publish_formats,
                "include_human_feedback": request.include_human_feedback,
                "follow_guidelines": request.follow_guidelines,
                "model": request.model,
                "guidelines": request.guidelines,
                "verbose": request.verbose,
                "knowledge_base_id": kb_id,
            }

            # Initialize the CourseAgent
            course_agent = CourseAgent(
                task, websocket=websocket, stream_output=stream_output
            )

            result = await course_agent.run_research_task()

            # Send the final result
            await self.send_text_message(
                websocket,
                "Course generation completed",
                extra_metadata={"result": result},
            )

        except WebSocketDisconnect:
            print("WebSocket disconnected")
        except Exception as e:
            await self.send_error(websocket, f"Course generation failed: {str(e)}")


ws_manager = ConnectionManager()
