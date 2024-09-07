from fastapi import WebSocket
from typing import Dict, Any, Optional
from src.constants import GlobalConfig
import base64
from enum import Enum


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


ws_manager = ConnectionManager()
