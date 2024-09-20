import os
import datetime
from sqlalchemy import func, update
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.manager import DatabaseManager
from src.database.models import Assistant, Conversation, Message, Source
from src.dependencies import get_db_manager
from src.agents.base import ChatAssistant
from api.models.assistant import (
    AssistantCreate, 
    AssistantResponse, 
    ChatMessage, 
    ChatResponse, 
    ConversationResponse,
    MessageResponse,
    SourceResponse
)
from typing import List, Dict, Optional, Generator, Any
from api.utils.websocket_manager import ws_manager
from src.tools.kb_search_tool import RetrievalResponses 
import logging
from src.utils.misc import generate_conversation_title

class AssistantService:
    def __init__(self, db_manager: DatabaseManager = Depends(get_db_manager)):
        self.db_manager = db_manager

    def create_assistant(self, user_id: int, assistant_data: AssistantCreate) -> AssistantResponse:

        with self.db_manager.Session() as session:
            new_assistant = Assistant(
                user_id=user_id, 
                name=assistant_data.name, 
                description=assistant_data.description,
                systemprompt=assistant_data.systemprompt,
                knowledge_base_id=assistant_data.knowledge_base_id, 
                configuration=assistant_data.configuration
            )
            
            session.add(new_assistant)
            session.commit()
            session.refresh(new_assistant)

            return AssistantResponse.model_validate(new_assistant)

    def delete_assistant(self, assistant_id: int, user_id: int) -> bool:
        return self.db_manager.delete_assistant(assistant_id, user_id)


    def get_all_assistants(self, user_id: int) -> List[AssistantResponse]:
        try:
            with self.db_manager.Session() as session:
                assistants = session.query(Assistant).filter_by(user_id=user_id).all()
                return [AssistantResponse.model_validate(assistant) for assistant in assistants]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while fetching assistants: {str(e)}")

    def get_assistant(self, assistant_id: int, user_id: int) -> Optional[AssistantResponse]:
        try:
            with self.db_manager.Session() as session:
                assistant = session.query(Assistant).filter_by(id=assistant_id, user_id=user_id).first()
                if not assistant:
                    return None
                return AssistantResponse.model_validate(assistant)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while fetching assistant: {str(e)}")

    def create_conversation(self, user_id: int, assistant_id: str) -> ConversationResponse:
        try:
            with self.db_manager.Session() as session:
                assistant = session.query(Assistant).filter_by(id=assistant_id, user_id=user_id).first()
                if not assistant:
                    raise HTTPException(status_code=404, detail="Assistant not found")
                
                new_conversation = Conversation(
                    user_id=user_id,
                    assistant_id=assistant_id,
                    title="New Chat"
                )
                session.add(new_conversation)
                session.flush()  # Flush to get the new conversation ID

                initial_message = Message(
                    conversation_id=new_conversation.id,
                    sender_type="assistant",
                    content="Hello! How can I help you today?"
                )
                session.add(initial_message)
                
                session.commit()
                session.refresh(new_conversation)
                
                return ConversationResponse.model_validate(new_conversation)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while creating the conversation: {str(e)}")


    def get_assistant_conversations(self, assistant_id: int, user_id: int) -> Optional[List[ConversationResponse]]:
        try:
            with self.db_manager.Session() as session:
                assistant = session.query(Assistant).filter_by(id=assistant_id, user_id=user_id).first()
                if not assistant:
                    return None
                
                conversations = session.query(Conversation).filter_by(assistant_id=assistant_id).all()
                return [ConversationResponse.model_validate(conversation) for conversation in conversations]
        except Exception as e:
            logging.error(f"An error occurred while fetching conversations: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An error occurred while fetching conversations: {str(e)}")

    def chat_with_assistant(self, conversation_id: int, user_id: int, message: ChatMessage) -> ChatResponse:
        try:
            with self.db_manager.Session() as session:
                conversation = session.query(Conversation).filter_by(id=conversation_id, user_id=user_id).first()
                if not conversation:
                    raise HTTPException(status_code=404, detail="Conversation not found")
                
                # Fetch message history
                message_history = self._get_message_history(session, conversation_id)
                
                # Save user message
                user_message = Message(
                    conversation_id=conversation_id,
                    sender_type="user",
                    content=message.content
                )
                session.add(user_message)
                session.flush()  # Flush to get the ID of the new message
            
                assistant = conversation.assistant
                assistant_config = self._get_assistant_config(assistant, conversation_id)
                
                assistant_instance = ChatAssistant(assistant_config)
                response = assistant_instance.on_message(message.content, message_history)
                
                # Save assistant message
                assistant_message = Message(
                    conversation_id=conversation_id,
                    sender_type="assistant",
                    content=response
                )
                session.add(assistant_message)
                
                session.commit()
                
                return ChatResponse(assistant_message=response)
        
        except Exception as e:
            logging.error(f"An error occurred during the chat: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An error occurred during the chat: {str(e)}")

    def stream_chat_with_assistant(self, conversation_id: int, user_id: int, message: ChatMessage) -> Generator[str, None, None]:
        with self.db_manager.Session() as session:
            conversation = session.query(Conversation).filter_by(id=conversation_id, user_id=user_id).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            message_history = self._get_message_history(session, conversation_id)
            
            user_message = Message(
                conversation_id=conversation_id,
                sender_type="user",
                content=message.content
            )
            session.add(user_message)
            session.flush()

            assistant = conversation.assistant
            assistant_config = self._get_assistant_config(assistant, conversation_id)
            
            assistant_instance = ChatAssistant(assistant_config)
            
            full_response = ""
            for chunk in assistant_instance.stream_chat(message.content, message_history):
                full_response += chunk
                yield chunk
            
            assistant_message = Message(
                conversation_id=conversation_id,
                sender_type="assistant",
                content=full_response
            )
            session.add(assistant_message)
            session.commit()
    async def astream_chat_with_assistant(self, conversation_id: int, user_id: int, message: ChatMessage):
        with self.db_manager.Session() as session:
            conversation = session.query(Conversation).filter_by(id=conversation_id, user_id=user_id).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            message_history = self._get_message_history(session, conversation_id)
            is_first_message = session.query(Message).filter_by(conversation_id=conversation_id, sender_type="user").count() == 0
            logging.error(f"is_first_message: {is_first_message}")
            user_message = Message(
                conversation_id=conversation_id,
                sender_type="user",
                content=message.content
            )
            session.add(user_message)
            session.flush()

            assistant = conversation.assistant
            assistant_config = self._get_assistant_config(assistant, conversation_id)
            
            max_source_index = self._get_max_source_index(session, conversation_id)
            assistant_instance = ChatAssistant(assistant_config, max_source_index)
                        
            full_response = ""
            response = await assistant_instance.astream_chat(message.content, message_history)
            
            for source in response.sources:
                yield {"type": "sources", "sources": source.raw_output.to_dict()}
                self._add_sources_to_db(session, conversation_id, source.raw_output.to_dict())
                
            async for chunk in response.async_response_gen():
                full_response += chunk
                yield {"type": "text", "content": chunk}
            
            assistant_message = Message(
                conversation_id=conversation_id,
                sender_type="assistant",
                content=full_response
            )
            session.add(assistant_message)
            
            if is_first_message:
                # Generate and update the conversation title
                new_title = self.generate_conversation_title(message.content, full_response)
                session.execute(
                    update(Conversation).
                    where(Conversation.id == conversation_id).
                    values(title=new_title)
                )
                yield {"type": "update_title", "content": new_title}
            session.commit()

    def generate_conversation_title(self, user_message: str, assistant_response: str) -> str:
        return generate_conversation_title(user_message, assistant_response)

    def _get_message_history(self, session: Session, conversation_id: int) -> List[Dict[str, str]]:
        messages = session.query(Message).filter_by(conversation_id=conversation_id).order_by(Message.created_at).all()
        sources = session.query(Source).filter_by(conversation_id=conversation_id).order_by(Source.index).all()

        history = [{"content": msg.content, "role": msg.sender_type} for msg in messages]

        # Add sources as messages with role "tool"
        for source in sources:
            history.append({
                "content": source.text,
                "role": "assistant",
                "metadata": {
                    "url": source.url,
                    "chunk_start": source.chunk_start,
                    "chunk_end": source.chunk_end
                }
            })

        # Sort the combined history by creation time
        return sorted(history, key=lambda x: x.get('created_at', datetime.datetime.min))

    def _get_max_source_index(self, session: Session, conversation_id: int) -> int:
        max_index = session.query(func.max(Source.index)).filter_by(conversation_id=conversation_id).scalar()
        return max_index or 0

    def get_sources(self, conversation_id: int, user_id: int) -> List[SourceResponse]:
        with self.db_manager.Session() as session:
            sources = session.query(Source).filter_by(conversation_id=conversation_id).all()
            return [
                SourceResponse.model_validate({
                    "id": source.id, 
                    "conversation_id": source.conversation_id, 
                    "text": source.text, 
                    "url": source.url, 
                    "chunk_start": source.chunk_start, 
                    "chunk_end": source.chunk_end, 
                    "index": source.index
                }) 
                for source in sources
            ]
            
    def _add_sources_to_db(self, session: Session, conversation_id: int, sources: List[Dict[str, Any]]):
        for source in sources:
            new_source = Source(
                conversation_id=conversation_id,
                text=source["text"],
                index=source["index"],
                url=source["url"],
                chunk_start=source["chunk_start"],
                chunk_end=source["chunk_end"]
            )
            session.add(new_source)
            
    def get_conversation_history(self, conversation_id: int, user_id: int) -> List[MessageResponse]:
        try:
            with self.db_manager.Session() as session:
                conversation = session.query(Conversation).filter_by(id=conversation_id, user_id=user_id).first()
                
                if not conversation:
                    raise HTTPException(status_code=404, detail="Conversation not found")
                
                messages = session.query(Message).filter_by(conversation_id=conversation_id).order_by(Message.created_at).all()
                return [MessageResponse.model_validate(message) for message in messages]
        except Exception as e:
            logging.error(f"An error occurred while fetching conversation history: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An error occurred while fetching conversation history: {str(e)}")
        
        
    def _get_assistant_config(self, assistant: Assistant, conversation_id: int) -> Dict[str, Any]:
        configuration = assistant.configuration
        return {
            "model": configuration["model"],
            "service": configuration["service"],
            "temperature": configuration["temperature"],
            "embedding_service": "openai",  # TODO: Let user choose embedding model
            "embedding_model_name": "text-embedding-3-small",
            "collection_name": f"kb_{assistant.knowledge_base_id}",
            "conversation_id": conversation_id,
            "system_prompt": assistant.systemprompt
        }
