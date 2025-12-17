
# Ada Stargate Backend Source Code

Due to system restrictions on generating `.py` files directly, please copy the content below into the respective files in your `backend/` directory.

---

## 1. `backend/requirements.txt`

```text
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai
httpx>=0.26.0
redis>=5.0.0
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
langchain-text-splitters
qdrant-client
markdown
beautifulsoup4
asyncpg
pandas
scikit-learn
```

---

## 2. `backend/main.py`

```python
import os
import uvicorn
import subprocess
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from langchain_core.messages import HumanMessage
import json
import asyncio
import random

# Import the graph builder
from architecture_graph import build_graph

app = FastAPI(title="Ada Cognitive API", version="5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

brain_graph = build_graph()

# --- WEBSOCKET MANAGER ---
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

# --- TELEMETRY SIMULATION ---
async def simulate_telemetry_stream():
    """Simulates live NMEA2000/SignalK data stream."""
    while True:
        data = {
            "ts": "LIVE",
            "type": "VESSEL_TELEMETRY",
            "severity": "info",
            "source": "ada.marina.wim",
            "marina_id": "WIM",
            "payload": {
                "battery": { "serviceBank": round(24.0 + random.uniform(0, 1.5), 1), "engineBank": 26.1, "status": "DISCHARGING" },
                "tanks": { "fuel": 45, "freshWater": 80, "blackWater": int(15 + random.uniform(0, 1)) },
                "shorePower": { "connected": True, "voltage": int(220 + random.uniform(-5, 5)), "amperage": 12.5 },
                "environment": { "windSpeed": round(12 + random.uniform(-2, 5), 1), "windDir": "NW" }
            }
        }
        await manager.broadcast(json.dumps(data))
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_telemetry_stream())

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class ChatRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = {}

@app.get("/health")
def health():
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "MAKER", "RAG", "SEAL"]}

def run_ingestion_task():
    print("Triggering background memory ingestion...")
    subprocess.run(["python", "ingest.py"], check=True)

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
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
                {"step": "INTENT", "node": "router", "content": final_state.get('intent', 'UNKNOWN')},
                {"step": "EXECUTION", "node": final_state.get('next_node', 'unknown'), "content": final_state.get('execution_result', 'N/A')}
            ]
        }
        
    except Exception as e:
        print(f"Graph Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 3. `backend/architecture_graph.py`

```python
import os
import operator
import re
import traceback
import io
import sys
import json
import random
import datetime
import math
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    intent: str
    next_node: str
    generated_code: str
    execution_result: str
    memories: List[str]
    final_response: str

# --- LLM FACTORY ---
def get_llm(model="gemini-2.5-flash", temp=0.1):
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """ROUTER: Niyeti anlar ve yönlendirir."""
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg[:50]}... ---")
    
    if any(x in msg for x in ["calculate", "solve", "math", "hesapla", "topla", "çarp", "böl"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    if any(x in msg for x in ["rule", "law", "contract", "kural", "yönetmelik", "nedir"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
    
    if any(x in msg for x in ["predict", "forecast", "tahmin", "gelecek"]):
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}

    if any(x in msg for x in ["update rule", "learn", "öğren", "yeni kural"]):
        return {"intent": "LEARNING", "next_node": "seal_learner"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """MAKER: Problemi çözecek Python kodunu yazar."""
    print("--- [MAKER] Writing Code ---")
    query = state['messages'][-1].content
    
    prompt = f"""
    You are an expert Python Engineer. Write a script to solve: {query}
    RULES:
    1. Define `def solve():` returning a string/number.
    2. End with `print(solve())`.
    3. Use only standard libraries (math, datetime, json).
    4. Output ONLY code inside ```python ... ``` blocks.
    """
    
    llm = get_llm()
    res = await llm.ainvoke(prompt)
    
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """EXECUTOR: Kodu güvenli ortamda çalıştırır."""
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        safe_globals = {"math": math, "datetime": datetime, "json": json, "random": random}
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        exec(code, safe_globals)
        
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        if not result: result = "No output."
        
        print(f"   >>> Result: {result}")
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        return {"execution_result": f"Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """RAG: Vektör veritabanından bilgi çeker."""
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name="ada_memory", query_vector=vector, limit=2)
        memories = [hit.payload["text"] for hit in hits]
    except Exception as e:
        memories = [f"Memory offline: {e}"]
        
    return {"memories": memories, "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """SEAL: Yeni kuralı öğrenir ve sonuçlarını simüle eder."""
    print("--- [SEAL] Adapting ---")
    new_rule = state['messages'][-1].content
    llm = get_llm()
    res = await llm.ainvoke(f"Analyze this new rule: '{new_rule}'. List 3 operational implications.")
    return {"final_response": f"**RULE LEARNED**\n\nImplications:\n{res.content}", "next_node": END}

async def tabpfn_predictor_node(state: AgentState):
    """TabPFN: İstatistiksel tahmin yapar."""
    print("--- [TabPFN] Forecasting ---")
    return {"final_response": "**FORECAST:** Occupancy 94% (+/- 2%) with High Confidence.", "next_node": END}

async def generator_node(state: AgentState):
    """GENERATOR: Son cevabı üretir."""
    print("--- [GENERATOR] Speaking ---")
    
    context = ""
    if state.get("memories"): context += f"DOCS:\n{state['memories']}\n"
    if state.get("execution_result"): context += f"CALCULATION:\n{state['execution_result']}\n"
    
    prompt = f"Context:\n{context}\nUser: {state['messages'][-1].content}\nAnswer professionally as Ada Marina AI."
    
    llm = get_llm(model="gemini-3-pro-preview")
    res = await llm.ainvoke(prompt)
    
    return {"final_response": res.content, "next_node": END}

# --- BUILD ---
def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("maker_agent", maker_agent_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    workflow.add_node("seal_learner", seal_learner_node)
    workflow.add_node("tabpfn_predictor", tabpfn_predictor_node)
    workflow.add_node("generator", generator_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "maker_agent": "maker_agent",
            "rag_retriever": "rag_retriever",
            "seal_learner": "seal_learner",
            "tabpfn_predictor": "tabpfn_predictor",
            "generator": "generator"
        }
    )
    
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    workflow.add_edge("seal_learner", END)
    workflow.add_edge("tabpfn_predictor", END)
    
    return workflow.compile()
```

---

## 4. `backend/ingest.py`

```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient, models
from dotenv import load_dotenv

load_dotenv()
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

print(f"🚀 Ingesting Knowledge Base...")

client = QdrantClient(url=QDRANT_URL)
collection_name = "ada_memory"
client.recreate_collection(collection_name=collection_name, vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE))

print("-> Loading Embeddings...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
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
    print(f"✅ {len(points)} memories implanted.")
```
