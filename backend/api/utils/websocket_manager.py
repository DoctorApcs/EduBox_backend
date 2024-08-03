from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[conversation_id] = websocket

    def disconnect(self, conversation_id: int):
        self.active_connections.pop(conversation_id, None)

    async def send_message(self, conversation_id: int, message: str, sender_type: str = "assistant"):
        if websocket := self.active_connections.get(conversation_id):
            await websocket.send_json({"content": message, "sender_type": sender_type})
            
ws_manager = ConnectionManager()