from typing import Dict

from api.models.auth import UserInDB

# Fake user database
fake_users_db: Dict[str, UserInDB] = {
    "user@example.com": UserInDB(
        username="user@example.com",
        full_name="John Doe",
        hashed_password="$2b$12$KIXkT4XQChXw1ZriKZBu/Omt9zZc8G64fd1JmHZL6sAyXt04zIV7e",  # bcrypt hash for "password123"
        disabled=False,
    )
}

# Function to get a user from the database
def get_user(db, username: str):
    return db.get(username)
