from api.utils.websocket_manager import ws_manager
from llama_index.core.tools import FunctionTool
import asyncio

def load_display_tool(conversation_id):

    def display_video(video_path):
        """
        Display the video at the given path.

        Parameters:
        - video_path (str): The path to the video file.

        Returns:
        - str: The response message.
        """
        asyncio.run(ws_manager.send_message(conversation_id, f"Displaying video at path: {video_path} in {conversation_id}"))
        return {"content": f"Displaying video at path: {video_path}"}

    return FunctionTool.from_defaults(display_video)