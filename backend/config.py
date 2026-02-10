import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv("API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL", "http://ada-qdrant:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://ada-redis:6379")
    MQTT_BROKER = os.getenv("MQTT_BROKER", "ada-mqtt")
    COLLECTION_NAME = "ada_memory"
    
    # Models
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    LLM_MODEL = "gemini-2.5-flash"
    REASONING_MODEL = "gemini-3-pro-preview"
