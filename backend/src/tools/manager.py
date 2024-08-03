from .kb_search_tool import load_knowledge_base_search_tool
from .display_tool import load_display_tool

class ToolManager:
    def __init__(self, conversation_id):
        self.tools = [
            load_knowledge_base_search_tool(),
            load_display_tool(conversation_id)
        ]

    def add_tool(self, tool):
        self.tools.append(tool)

    def get_tool(self, name):
        for tool in self.tools:
            if tool.name == name:
                return tool

    def get_tools(self):
        return self.tools

    def remove_tool(self, name):
        for tool in self.tools:
            if tool.name == name:
                self.tools.remove(tool)
                return

    def run_tool(self, name, args):
        tool = self.get_tool(name)
        if tool:
            tool.run(args)
        else:
            print(f"Tool {name} not found")