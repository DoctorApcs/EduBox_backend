import os
from fastapi import Depends
from src.dependencies import get_db_manager
from src.database.manager import DatabaseManager
from src.tools.kb_search_tool import load_knowledge_base_search_tool
from src.constants import GlobalConfig
from llama_index.core.base.llms.types import ChatMessage as LLamaIndexChatMessage
from llama_index.llms.openai import OpenAI
from llama_index.agent.openai import OpenAIAgent


class ChatAssistant:
    def __init__(self, configuration: dict, db_manager: DatabaseManager = Depends(get_db_manager)):
        self.db_manager = db_manager
        self.configuration = configuration
        self._init_agent()
        
    def _init_agent(self):
        model_name = self.configuration.get("model")
        service = self.configuration.get("service")
        
        self.llm = self._init_model(service, model_name)
        self.tools = self._init_tools()
        
        self.agent = OpenAIAgent.from_tools(
            tools=self.tools,
            llm=self.llm,
            verbose=True
        )
        
    def _init_model(self, service, model_id):
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
            return OpenAI(
                model=model_id, 
                temperature=self.configuration["temperature"], 
                api_key=GlobalConfig.MODEL.OPENAI_API_KEY)
        else:
            raise NotImplementedError("The implementation for other types of LLMs are not ready yet!")
        
    def _init_tools(self):
        return [load_knowledge_base_search_tool(self.configuration)]    

    def on_message(self, message, message_history) -> str:
        message_history = [LLamaIndexChatMessage(content=msg["content"], role=msg["role"]) for msg in message_history]
        return self.agent.chat(message, message_history).response