import os
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.manager import DatabaseManager
from src.database.models import Assistant
from src.dependencies import get_db_manager
from api.models.assistant import AssistantCreate, AssistantResponse, ChatMessage, ChatResponse
from llama_index.llms.openai import OpenAI


class AssistantService:
    def __init__(self, db_manager: DatabaseManager = Depends(get_db_manager)):
        self.db_manager = db_manager

    def create_assistant(self, user_id: int, assistant_data: AssistantCreate) -> AssistantResponse:

        with self.db_manager.Session() as session:
            new_assistant = Assistant(user_id=user_id, name=assistant_data.name, description=assistant_data.description,
                                  knowledge_base_id=assistant_data.knowledge_base_id, configuration=assistant_data.configuration)
            session.add(new_assistant)
            session.commit()
            return AssistantResponse.model_validate(new_assistant)

    def delete_assistant(self, assistant_id: int, user_id: int) -> bool:
        return self.db_manager.delete_assistant(assistant_id, user_id)

    def chat_with_assistant(self, assistant_id: int, user_id: int, message: ChatMessage) -> ChatResponse:
        with self.db_manager.Session() as session:
            assistant = session.query(Assistant).filter_by(id=assistant_id, user_id=user_id).first()
            if not assistant:
                raise HTTPException(status_code=404, detail="Assistant not found")
            
            # Here we assume that the Assistant class has an on_message method
            # In a real implementation, you might need to instantiate the assistant with its configuration
            assistant_instance = ChatAssistant(assistant.configuration, assistant.knowledge_base_id)
            response = assistant_instance.on_message(message.content)
            
            return ChatResponse(assistant_message=response)
        
        
        
class ChatAssistant:
    def __init__(self, configuration: dict, knowledge_base_id : int, db_manager: DatabaseManager = Depends(get_db_manager)):
        self.db_manager = db_manager
        self.configuration = configuration
        self.knowledge_base_id = knowledge_base_id
        self.load_assistant()
        
    def load_assistant(self):
        model_name = self.configuration.get("model")
        service = self.configuration.get("service")
        self.llm = self.load_model(service, model_name)
        
        
    def load_model(self, service, model_id):
        """
        Select a model for text generation using multiple services.
        Args:
            service (str): Service name indicating the type of model to load.
            model_id (str): Identifier of the model to load from HuggingFace's model hub.
        Returns:
            LLM: llama-index LLM for text generation
        Raises:
            ValueError: If an unsupported model or device type is provided.
        """
        print(f"Loading Model: {model_id}")
        print("This action can take a few minutes!")
        # TODO: setup proper logging

        if service == "openai":
            print(f"Loading OpenAI Model: {model_id}")
            return OpenAI(model=model_id, temperature=self.configuration["temperature"], api_key=os.getenv("OPENAI_API_KEY"))
        else:
            raise NotImplementedError("The implementation for other types of LLMs are not ready yet!")
        
        
    def on_message(self, message):
        return self.llm.complete(message).text