from multi_agents.agents.master import ChiefEditorAgent

class CourseAgent:
    def __init__(self, websocket=None, stream_output=None, headers=None):
        self.websocket = websocket
        self.stream_output = stream_output
        self.headers = headers

    async def run(self, task):
        chief_editor = ChiefEditorAgent(task, self.websocket, self.stream_output, self.headers)
        await chief_editor.run()