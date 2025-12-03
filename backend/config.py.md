
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv("API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL", "http://ada-qdrant:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://ada-redis:6379")
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ada-local-llm:11434")
    
    # Model Configurations
    # Cloud Models (Primary)
    FAST_MODEL = "gemini-2.0-flash-lite-preview-02-05" 
    SMART_MODEL = "gemini-2.0-flash" 
    PRO_MODEL = "gemini-3-pro-preview" 
    
    # Local Models (Fallback)
    OFFLINE_MODEL = "gemma:2b"
    OFFLINE_EMBEDDING = "all-MiniLM-L6-v2"
    
    # Vector DB
    COLLECTION_NAME = "ada_memory"

    @staticmethod
    def validate():
        if not Config.API_KEY:
            print("⚠️ WARNING: API_KEY is missing. System will default to OFFLINE mode if possible.")

Config.validate()
```
