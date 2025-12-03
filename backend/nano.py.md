
```python
import logging
import os
from google import genai
from google.genai import types
try:
    from backend.config import Config
except ImportError:
    from config import Config

logger = logging.getLogger("nano_agent")

class NanoAgent:
    """
    A lightweight, zero-dependency wrapper for Gemini.
    Optimized for sub-second latency voice interactions (FastRTC).
    """
    def __init__(self, name: str, system_instruction: str):
        self.name = name
        self.client = genai.Client(api_key=Config.API_KEY)
        self.model_name = Config.FAST_MODEL
        self.system_instruction = system_instruction

    def chat(self, user_input: str) -> str:
        try:
            # Low temperature for strict protocol adherence
            # response_mime_type="text/plain" is faster than JSON
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_input,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.3,
                    response_mime_type="text/plain" 
                )
            )
            return response.text if response.text else "Anlaşılamadı, tamam."
        except Exception as e:
            logger.error(f"[{self.name}] Error: {e}")
            return "Sinyal zayıf, tekrar edin. Tamam."
```
