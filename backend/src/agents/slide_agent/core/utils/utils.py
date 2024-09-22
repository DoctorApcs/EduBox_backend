import json

def save_json(data: dict, file_path: str):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Data successfully saved to {file_path}")
    except Exception as e:
        print(f"Error saving data to {file_path}: {str(e)}")
        
def load_json(file_path: str):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data