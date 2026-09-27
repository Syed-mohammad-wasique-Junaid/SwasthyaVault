from dotenv import load_dotenv
import os

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./swasthyavault.db")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "swasthyavault-super-secret-key-2025")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
except (ValueError, TypeError):
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")