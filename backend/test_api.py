import requests
import time

def upload_and_check_status(file_path):
    # Upload file
    with open(file_path, 'rb') as file:
        response = requests.post(
            "http://localhost:8000/api/knowledge_base/",
            files={
                "file": file,
            },
            params = {
                "knowledge_base_id": 1
            }
        )
    
    if response.status_code == 202:
        print("File uploaded successfully")
        task_id = response.json()['task_id']
        
        # Check task status
        while True:
            status_response = requests.get(f"http://localhost:8000/api/knowledge_base/{task_id}")
            status_data = status_response.json()
            
            if status_data['status'] == 'completed':
                print("Task completed")
                print("Result:", status_data['result'])
                break
            elif status_data['status'] == 'failed':
                print("Task failed")
                print("Error:", status_data['error'])
                break
            else:
                print("Task still in progress...")
                time.sleep(5)  # Wait for 5 seconds before checking again
    else:
        print("File upload failed")
        print("Error:", response.text)

if __name__ == "__main__":
    file_path = "/home/bachngo/Desktop/code/Knowledge_Base_Agent/backend/data/file1.pdf"  # Replace with the path to your test document
    upload_and_check_status(file_path)