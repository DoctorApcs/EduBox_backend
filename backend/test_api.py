import requests

BASE_URL = "http://localhost:8000/api/assistant"

def test_create_assistant():
    data = {
        "name": "Test Assistant",
        "description": "A test assistant",
        "knowledge_base_id": 1,
        "configuration": {"model": "gpt-4o-mini", "service": "openai", "temperature": "0.8"}
    }
    response = requests.post(f"{BASE_URL}/", json=data)
    print("Create Assistant Response:", response.status_code)
    print(response.json())
    return response.json()["id"]

def test_delete_assistant(assistant_id):
    response = requests.delete(f"{BASE_URL}/{assistant_id}")
    print("Delete Assistant Response:", response.status_code)
    print(response.json())

def test_chat_with_assistant(assistant_id):
    data = {"content": "Hello, assistant!"}
    response = requests.post(f"{BASE_URL}/{assistant_id}/chat", json=data)
    print("Chat Response:", response.status_code)
    print(response.json())

if __name__ == "__main__":
    # Create an assistant
    assistant_id = test_create_assistant()

    # Chat with the assistant
    test_chat_with_assistant(assistant_id)

    # Delete the assistant
    test_delete_assistant(assistant_id)