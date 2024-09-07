from typing import Optional, Dict, Any
from fastapi import WebSocket


async def stream_output(
    type,
    content,
    output,
    websocket: Optional[WebSocket] = None,
    logging=None,
    metadata: Optional[Dict[str, Any]] = None,
):
    """
    Streams output to the websocket
    Args:
        type:
        content:
        output:

    Returns:
        None
    """
    if not websocket or logging:
        try:
            print(output)
        except UnicodeEncodeError:
            # Option 1: Replace problematic characters with a placeholder
            print(output.encode("cp1252", errors="replace").decode("cp1252"))

    if websocket:
        await websocket.send_json(
            {"type": type, "content": content, "output": output, "metadata": metadata}
        )
