from llama_index.llms.openai import OpenAI
from llama_index.core.prompts import PromptTemplate
import logging
from src.constants import GlobalConfig

def generate_conversation_title(user_message: str, agent_response: str) -> str:
    try:
        # Initialize LlamaIndex components
        llm = OpenAI(temperature=0.8, model=GlobalConfig.MODEL.FAST_LLM_MODEL)

        # Create a prompt template for title generation
        prompt_template = PromptTemplate(
            "Based on the following conversation, generate a concise and relevant title (max 50 characters):\n"
            "User: {user_message}\n"
            "Assistant: {agent_response}\n"
            "Title: "
        )

        # Generate the title
        title = llm.complete(
            prompt_template.format(user_message=user_message, agent_response=agent_response)
        )

        return title.text.strip()
    except Exception as e:
        logging.error(f"Error generating conversation title: {str(e)}")
        # Fallback to the simple implementation if there's an error
        return agent_response[:30] + "..." if len(agent_response) > 30 else agent_response