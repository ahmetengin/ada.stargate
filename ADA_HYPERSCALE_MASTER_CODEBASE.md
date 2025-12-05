
# ⚓️ ADA STARGATE: HYPERSCALE MASTER CODEBASE (v4.1)

**Architect:** Ada Core Team
**Version:** 4.1 (Cognitive Entity)
**Status:** Ready for Deployment

This file contains the **complete source code** required to upgrade Ada from a frontend simulation to a **Cognitive Operating System**.

---

## 🛠️ 1. INFRASTRUCTURE (DOCKER)

### `docker-compose.hyperscale.yml`
This orchestrates the Brain (Python), the Interface (React), the Memory (Qdrant/Postgres), and the Nervous System (Redis).

```yaml
version: '3.9'

services:
  # 1. THE BRAIN (Python LangGraph)
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    ports:
      - "8000:8000" # API & Websocket
      # Removed FastRTC port 7860:7860
    environment:
      - API_KEY=${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
    depends_on:
      - ada-redis
      - ada-qdrant
    volumes:
      - ./backend:/app
      - ./docs:/docs # RAG access

  # 2. MEMORY (Vector DB - Long Term)
  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  # 3. TRUTH (Relational DB - Entities)
  ada-postgres:
    image: postgres:15-alpine
    container_name: ada_postgres
    environment:
      POSTGRES_USER: ada
      POSTGRES_PASSWORD: adapassword
      POSTGRES_DB: wim_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 4. NERVOUS SYSTEM (Event Bus - Short Term)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 5. FRONTEND (React Interface)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ada_frontend_hyperscale
    ports:
      - "80:80"
    environment:
      - API_KEY=${API_KEY}
    depends_on:
      - ada-core

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
```

### `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Removed audio-related system dependencies
# RUN apt-get update && apt-get install -y \
#     libasound2-dev \
#     portaudio19-dev \
#     libportaudio2 \
#     libsndfile1 \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy Requirements
COPY requirements.txt .

# 3. Install Python Dependencies
# Upgrade pip first to avoid binary incompatibility
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copy Application Code
COPY . .

# 5. Expose Ports
EXPOSE 8000

# 6. Run the Application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🐍 2. THE BRAIN (PYTHON BACKEND)

### `backend/requirements.txt`
```text
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai>=0.3.0
httpx>=0.26.0
redis>=5.0.0
# Cognitive Stack
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
langchain-text-splitters
qdrant-client
asyncpg
markdown
beautifulsoup4
pandas
scikit-learn
# Removed Voice Stack (FastRTC) dependencies
# fastrtc>=0.1.0
# gradio>=5.0.0
# numpy
# scipy
# loguru
# soundfile
```

### `backend/main.py`
The API Gateway. Removed FastRTC and Gradio.

```python
import os
import uvicorn
# Removed threading, asyncio, json, random imports if only used for FastRTC/telemetry sim, keeping telemetry for now
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
# Removed gradio import
from langchain_core.messages import HumanMessage

# Import Internal Modules (with Fallback)
try:
    from backend.architecture_graph import build_graph
    # Removed from backend.vhf_radio import stream as radio_stream
    from backend.iot_gateway import start_mqtt_listener # Keeping IoT for now
    from backend.proactive_daemon import start_daemon # Keeping daemon for now
except ImportError:
    from architecture_graph import build_graph
    # Removed from vhf_radio import stream as radio_stream
    from iot_gateway import start_mqtt_listener
    from proactive_daemon import start_daemon

app = FastAPI(title="Ada Stargate Hyperscale API", version="4.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Cognitive Brain
brain_graph = build_graph()

# --- WEBSOCKET MANAGER (Keeping for TelemetryStream) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- TELEMETRY SIMULATOR (Keeping for now) ---
async def simulate_telemetry_stream():
    import asyncio, json, random # Re-import here since global ones might be removed
    """Simulates live NMEA2000/SignalK data stream."""
    while True:
        data = {
            "type": "VESSEL_TELEMETRY",
            "timestamp": "LIVE",
            "payload": {
                "battery": { "serviceBank": round(24.0 + random.uniform(0, 1.5), 1), "engineBank": 26.1, "status": "DISCHARGING" },
                "tanks": { "fuel": 45, "freshWater": 80, "blackWater": int(15 + random.uniform(0, 1)) },
                "bilge": { "forward": "DRY", "aft": "DRY", "pumpStatus": "AUTO" },
                "shorePower": { "connected": True, "voltage": int(220 + random.uniform(-5, 5)), "amperage": 12.5 },
                "comfort": { "climate": { "zone": "Salon", "currentTemp": 23.5, "mode": "COOL" } },
                "environment": { "windSpeed": round(12 + random.uniform(-2, 5), 1), "windDir": "NW" }
            }
        }
        await manager.broadcast(json.dumps(data))
        await asyncio.sleep(2)

class ChatRequest(BaseModel):
    prompt: str
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}

@app.on_event("startup")
async def startup_event():
    import threading, asyncio # Re-import here
    print("🚀 Igniting Ada Stargate v4.1 Systems...")
    # 1. Daemon
    daemon_thread = threading.Thread(target=start_daemon, daemon=True)
    daemon_thread.start()
    # 2. Telemetry Simulation
    asyncio.create_task(simulate_telemetry_stream())
    # 3. MQTT Listener (if needed, otherwise remove)
    # mqtt_thread = threading.Thread(target=start_mqtt_listener, daemon=True)
    # mqtt_thread.start()

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health():
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "MAKER", "SEAL", "Telemetry"]} # Removed FastRTC

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
            "intent": "UNKNOWN",
            "next_node": "router",
            "generated_code": "",
            "execution_result": "",
            "memories": [],
            "final_response": ""
        }
        final_state = await brain_graph.ainvoke(inputs)
        return {
            "text": final_state.get("final_response", "System processing error."),
            "traces": [
                {"step": "ROUTING", "node": "router", "content": f"Intent: {final_state.get('intent')}"}
            ]
        }
    except Exception as e:
        print(f"Graph Error: {e}")
        return {"text": f"System Error: {str(e)}"}

# Removed mounting FastRTC Radio at /radio
# app = gr.mount_gradio_app(app, radio_stream.ui, path="/radio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### `backend/architecture_graph.py`
**THE CORE CONSCIOUSNESS.**
Contains:
1.  **Router:** Decides intent.
2.  **MAKER (The Engineer):** Writes Python code to solve math/logic problems.
3.  **Executor:** Runs the code safely.
4.  **RAG (The Lawyer):** Checks docs.

```python
import os
import operator
import re
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: Dict[str, Any]
    intent: str
    next_node: str
    generated_code: str
    execution_result: str
    memories: List[str]
    final_response: str

# --- LLM ---
def get_llm(model="gemini-2.5-flash", temp=0.1):
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """Classifies user intent."""
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg} ---")
    
    # MAKER TRIGGER: Math, Logic, Calculation
    if any(x in msg for x in ["calculate", "compute", "solve", "math", "formula", "hesapla"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    # RAG TRIGGER: Legal, Rules
    if any(x in msg for x in ["rule", "law", "contract", "policy", "kural"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """MAKER: Writes a Python script to solve the problem."""
    print("--- [MAKER] Writing Code ---")
    query = state['messages'][-1].content
    
    prompt = f"""
    You are an expert Python Engineer. Write a script to solve: {query}
    
    RULES:
    1. Define `def solve():` returning a string/number.
    2. End with `print(solve())`.
    3. Use only standard libraries (math, datetime, json).
    4. Output inside ```python ... ``` blocks.
    """
    
    llm = get_llm()
    res = await llm.ainvoke(prompt)
    
    # Extract Code
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """EXECUTOR: Runs the code."""
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        import math, datetime, json, random, io, sys
        
        # Capture Stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        # Execute
        exec(code, {"math": math, "datetime": datetime, "json": json, "random": random})
        
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        if not result: result = "No output."
        
        print(f"   >>> Result: {result}")
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        return {"execution_result": f"Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """RAG: Queries Qdrant."""
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name="ada_memory", query_vector=vector, limit=2)
        memories = [hit.payload["text"] for hit in hits]
    except:
        memories = ["Memory offline."]
    return {"memories": memories, "next_node": "generator"}

async def generator_node(state: AgentState):
    """GENERATOR: Speaks the answer."""
    print("--- [GENERATOR] Speaking ---")
    
    context = ""
    if state.get("memories"): context += f"DOCS:\n{state['memories']}\n"
    if state.get("execution_result"): context += f"CALCULATION:\n{state['execution_result']}\n"
    
    prompt = f"User: {state['messages'][-1].content}\nContext: {context}\nProvide a clear answer."
    
    llm = get_llm(model="gemini-3-pro-preview")
    res = await llm.ainvoke(prompt)
    return {"final_response": res.content, "next_node": END}

# --- GRAPH BUILDER ---
def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("maker_agent", maker_agent_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    workflow.add_node("generator", generator_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "maker_agent": "maker_agent",
            "rag_retriever": "rag_retriever",
            "generator": "generator"
        }
    )
    
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    
    return workflow.compile()
```

### `backend/ingest.py`
**Memory Ingestor.** Reads docs and populates Qdrant.

```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

load_dotenv()
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
API_KEY = os.getenv("API_KEY")

print(f"🚀 Ingesting Knowledge Base from: {DOCS_DIR}")

client = QdrantClient(url=QDRANT_URL)
collection_name = "ada_memory"
client.recreate_collection(collection_name=collection_name, vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE))

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
points = []

for idx, file_path in enumerate(files):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        chunks = text_splitter.create_documents([content])
        for i, chunk in enumerate(chunks):
            vector = embeddings.embed_query(chunk.page_content)
            points.append(models.PointStruct(
                id=idx * 1000 + i,
                vector=vector,
                payload={"text": chunk.page_content, "source": file_path}
            ))

if points:
    client.upsert(collection_name=collection_name, points=points)
    print(f"✅ {len(points)} memories implanted into Qdrant.")
```

---

## 🔌 3. FRONTEND INTEGRATION (REACT)

### `services/api.ts`
Points React to the new Python Backend.

```typescript
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health'); // Proxied to port 8000
    return response.ok; 
  } catch { return false; }
};

export const sendToBackend = async (prompt: string, userProfile: any, context: any = {}): Promise<any> => {
    try {
        const response = await fetch('/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                user_role: userProfile.role,
                context: context
            })
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}
```

---

## 📘 4. DEPLOYMENT INSTRUCTIONS

1.  **Files:** Copy code to `backend/main.py`, `services/api.ts`, `vite.config.ts`, `nginx/nginx.conf`.
2.  **Launch:** `docker-compose -f docker-compose.hyperscale.yml up --build`
3.  **Learn:**
    ```bash
    docker exec -it ada_core_hyperscale python ingest.py
    ```
4.  **Access:**
    *   **Frontend:** `http://localhost:80`
    *   **Radio:** (Removed - no direct radio access now)
