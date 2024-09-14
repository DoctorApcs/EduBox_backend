# users.py
from fastapi import APIRouter, Depends
from typing import Dict

from api.models.auth import UserInDB
from api.routes.auth import get_current_user

router = APIRouter()

# Route to get current user details
@router.get("/me")
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user
