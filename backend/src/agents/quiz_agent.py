from multi_agents.agents.utils.llms import call_model
from src.constants import GlobalConfig

QUIZ_PROMPT = """
You are a quiz agent. You are given content and you need to create a quiz for it. 

Content:
{content}

Instructions:
- Create multiple-choice questions based on the content provided.
- Each question should have four options labeled A, B, C, and D.
- Clearly indicate the correct answer for each question.
- Format the response in JSON with the following structure:

{{
  "questions": [
    {{
      "question": "What is the capital of France?",
      "options": {{
        "A": "Berlin",
        "B": "Madrid",
        "C": "Paris",
        "D": "Rome"
      }},
      "correct_answer": "C"
    }},
    ...
  ]
}}
"""

class QuizAgent:
    def __init__(self, websocket = None, stream_output = None, headers = None):
        self.websocket = websocket
        self.stream_output = stream_output
        self.headers = headers
    
    async def run(self, content: str):
        messages = [{"role": "user", "content": QUIZ_PROMPT.format(content=content)}]
        response = await call_model(messages, model=GlobalConfig.MODEL.FAST_LLM_MODEL, response_format="json")
        return response