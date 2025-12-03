
```python
import logging
import os
import httpx
from google import genai
from google.genai import types
try:
    from backend.config import Config
except ImportError:
    from config import Config

logger = logging.getLogger("hybrid_agent")

class NanoAgent:
    """
    Hybrid Agent: Prefers Cloud (Gemini), Falls back to Local (Gemma/Ollama).
    """
    def __init__(self, name: str, system_instruction: str):
        self.name = name
        self.system_instruction = system_instruction
        self.client = None
        
        # Initialize Cloud Client
        if Config.API_KEY:
            self.client = genai.Client(api_key=Config.API_KEY)
            
    def _is_internet_available(self):
        """Simple ping check to Google DNS"""
        try:
            httpx.get("http://8.8.8.8", timeout=0.5)
            return True
        except:
            return False

    def chat_local(self, user_input: str) -> str:
        """Fallback logic using Ollama (Gemma)"""
        logger.warning(f"[{self.name}] Switching to OFFLINE BRAIN (Gemma)...")
        try:
            url = f"{Config.OLLAMA_URL}/api/generate"
            payload = {
                "model": Config.OFFLINE_MODEL,
                "prompt": f"SYSTEM: {self.system_instruction}\nUSER: {user_input}",
                "stream": False
            }
            response = httpx.post(url, json=payload, timeout=30.0)
            if response.status_code == 200:
                return response.json().get("response", "Offline processing error.")
            return "Local brain unreachable."
        except Exception as e:
            logger.error(f"Local LLM Error: {e}")
            return "Sistem tamamen çevrimdışı."

    def chat(self, user_input: str) -> str:
        # 1. Try Cloud
        if self.client: # and self._is_internet_available(): # Uncomment ping check if strict
            try:
                response = self.client.models.generate_content(
                    model=Config.FAST_MODEL,
                    contents=user_input,
                    config=types.GenerateContentConfig(
                        system_instruction=self.system_instruction,
                        temperature=0.3,
                        response_mime_type="text/plain" 
                    )
                )
                return response.text if response.text else "..."
            except Exception as e:
                logger.error(f"Cloud Error: {e}. Attempting Fallback...")
        
        # 2. Fallback to Local
        return self.chat_local(user_input)
```
