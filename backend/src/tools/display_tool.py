from api.utils.websocket_manager import ws_manager, MediaType, EndStatus
from llama_index.core.tools import FunctionTool
import asyncio

def load_display_tool(conversation_id):

    def display_video(conversation_id: int, video_path: str):
        """
        Display the video at the given path.

        Parameters:
        - conversation_id (int): The ID of the conversation.
        - video_path (str): The path to the video file.

        Returns:
        - dict: The response message.
        """
        asyncio.run(ws_manager.send_media_chunk(
            conversation_id,
            MediaType.VIDEO,
            b'',  # We're not sending actual video data, just the path
            {
                "video_path": video_path,
                "action": "display"
            }
        ))
        asyncio.run(ws_manager.send_end_message(conversation_id, MediaType.VIDEO, EndStatus.COMPLETE))
        return {"content": f"Displaying video at path: {video_path}"}

    return FunctionTool.from_defaults(display_video)