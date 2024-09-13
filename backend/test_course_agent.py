from src.agents.course_agent import CourseAgent
from src.constants import GlobalConfig
import asyncio

task = {
  "query": "Database Design",
  "max_sections": 3,
  "follow_guidelines": True,
  "model": "gpt-4o-mini",
  "guidelines": GlobalConfig.MODEL.DEFAULT_GUIDELINES,
  "verbose": False
}

course_agent = CourseAgent(task=task, websocket=None, stream_output=None)

asyncio.run(course_agent.run_research_task())