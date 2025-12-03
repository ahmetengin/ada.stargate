
```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ChatRequest(BaseModel):
    prompt: str
    user_role: str = "GUEST"
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ChatResponse(BaseModel):
    text: str
    actions: Optional[List[Dict[str, Any]]] = []
    traces: Optional[List[Dict[str, Any]]] = []

class HealthCheck(BaseModel):
    status: str
    modules: List[str]
```
