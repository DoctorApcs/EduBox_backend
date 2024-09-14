# config.py
import os
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv(override=True)

SECRET_KEY = os.getenv("OPENSSL_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
