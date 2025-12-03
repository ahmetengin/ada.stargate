
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv("API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL", "http://ada-qdrant:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://ada-redis:6379")
    
    # Model Configurations
    # Lite model is critical for Voice latency
    FAST_MODEL = "gemini-2.0-flash-lite-preview-02-05" 
    SMART_MODEL = "gemini-2.0-flash" 
    PRO_MODEL = "gemini-3-pro-preview" 
    
    # Vector DB
    COLLECTION_NAME = "ada_memory"

    @staticmethod
    def validate():
        if not Config.API_KEY:
            # Don't crash immediately, but warn. Docker might inject it later.
            print("⚠️ WARNING: API_KEY is missing in environment variables.")

# Validate on import
Config.validate()
```
