from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "ResumeMatch AI"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # Hugging Face
    HUGGINGFACEHUB_API_TOKEN: str
    
    # Vector Store
    VECTOR_STORE: str = "faiss"  # faiss, pinecone, weaviate
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    PINECONE_INDEX_NAME: str = "resumematch"
    PINECONE_HOST: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS - Allow multiple frontend ports for development
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"
    
    # LLM Configuration
    LLM_REPO_ID: str = "microsoft/Phi-3-mini-4k-instruct"
    LLM_MAX_LENGTH: int = 1024
    LLM_TEMPERATURE: float = 0.1
    
    # Embeddings
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Text Splitting
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
