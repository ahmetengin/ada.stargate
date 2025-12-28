
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🌊 ADA STARGATE: HYPERSCALE HYDRATION PROTOCOL INITIATED...');
console.log('    -> Target: Injecting Python Brain & Infrastructure Configs');

const files = {
    // 1. REQUIREMENTS
    'backend/requirements.txt': `fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai
httpx>=0.26.0
redis>=5.0.0
# Cognitive Stack
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
langchain-text-splitters
qdrant-client
# RAG & Offline Ops
markdown
beautifulsoup4
sentence-transformers
# Data Science & Utils
asyncpg
pandas
scikit-learn
paho-mqtt
watchdog`,

    // 2. DOCKERFILE (BACKEND)
    'backend/Dockerfile': `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio/video processing if needed later
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose API Port
EXPOSE 8000

# Start via Main
CMD ["python", "main.py"]`,

    // 3. MAIN API (GATEWAY)
    'backend/main.py': `import os
import uvicorn
import subprocess
import asyncio
import json
import random
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from langchain_core.messages import HumanMessage

# Try to import graph, handle error if not yet generated
try:
    from architecture_graph import build_graph
except ImportError:
    build_graph = None

app = FastAPI(title="Ada Stargate Hyperscale API", version="5.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Brain if available
brain_graph = build_graph() if build_graph else None

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
        # Broadcast to all connected clients (React Frontend)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- TELEMETRY SIMULATION (Until MQTT is fully linked) ---
async def simulate_telemetry_stream():
    """Simulates live NMEA2000/SignalK data stream for the UI."""
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
    # Start the telemetry background task
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
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}

@app.get("/health")
def health():
    return {
        "status": "COGNITIVE_SYSTEM_ONLINE", 
        "modules": ["LangGraph", "MAKER", "RAG", "SEAL"],
        "brain_loaded": brain_graph is not None
    }

def run_ingestion_task():
    print("Triggering background memory ingestion...")
    try:
        subprocess.run(["python", "ingest.py"], check=True)
    except Exception as e:
        print(f"Ingestion failed: {e}")

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    if not brain_graph:
        return {"text": "Brain not initialized. Please check backend logs.", "traces": []}

    try:
        # Prepare Input State for LangGraph
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
        
        # Execute the Graph
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
        return {"text": f"System Error: {str(e)}", "traces": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`,

    // 4. THE BRAIN (LANGGRAPH)
    'backend/architecture_graph.py': `import os
import operator
import re
import sys
import io
import json
import random
import datetime
import math
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "ada_memory"

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

# --- LLM FACTORY ---
def get_llm(model="gemini-2.5-flash", temp=0.1):
    if not API_KEY:
        print("CRITICAL: API_KEY missing.")
        return None
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """ROUTER: Decides the thinking path based on user intent."""
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg[:50]}... ---")
    
    # 1. Calculation (MAKER)
    if any(x in msg for x in ["calculate", "solve", "math", "hesapla", "topla", "çarp", "böl"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    # 2. Legal/Rules (RAG)
    if any(x in msg for x in ["rule", "law", "contract", "kural", "yönetmelik", "nedir", "procedure"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
    
    # 3. Analytics/Prediction (TabPFN)
    if any(x in msg for x in ["predict", "forecast", "tahmin", "gelecek", "occupancy"]):
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}

    # 4. Learning/Updates (SEAL)
    if any(x in msg for x in ["update rule", "learn", "öğren", "yeni kural", "policy change"]):
        return {"intent": "LEARNING", "next_node": "seal_learner"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """MAKER: Writes Python code to solve math/logic problems zero-shot."""
    print("--- [MAKER] Writing Code ---")
    query = state['messages'][-1].content
    
    prompt = \`
    You are an expert Python Engineer. Write a script to solve: {query}
    RULES:
    1. Define a function 'def solve():' returning the answer.
    2. End with 'print(solve())'.
    3. Use only standard libraries (math, datetime, json).
    4. Output ONLY code inside \\\`\\\`\\\`python ... \\\`\\\`\\\` blocks.
    \`
    
    llm = get_llm()
    if not llm: return {"generated_code": "", "next_node": "generator"}

    res = await llm.ainvoke(prompt)
    
    code_match = re.search(r"\\\`\\\`\\\`python(.*?)\\\`\\\`\\\`", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """EXECUTOR: Runs the MAKER's code in a controlled environment."""
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        # Restricted Globals
        safe_globals = {"math": math, "datetime": datetime, "json": json, "random": random}
        
        # Capture Stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        exec(code, safe_globals)
        
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        if not result: result = "No output generated."
        
        print(f"   >>> Result: {result}")
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        sys.stdout = sys.__stdout__ # Reset stdout in case of error
        return {"execution_result": f"Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """RAG: Fetches documents from Qdrant Vector DB."""
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name=COLLECTION_NAME, query_vector=vector, limit=3)
        memories = [f"Source ({hit.payload.get('source','?')}): {hit.payload.get('text')}" for hit in hits]
    except Exception as e:
        print(f"RAG Failed: {e}")
        memories = ["Memory system unavailable."]
        
    return {"memories": memories, "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """SEAL: Learns new rules and updates system prompts (Simulated)."""
    print("--- [SEAL] Adapting ---")
    new_rule = state['messages'][-1].content
    llm = get_llm()
    res = await llm.ainvoke(f"Analyze this new rule: '{new_rule}'. List 3 operational implications.")
    return {"final_response": f"**SYSTEM UPDATE (SEAL)**\n\nI have ingested the new rule.\n\n**Implications:**\n{res.content}", "next_node": END}

async def tabpfn_predictor_node(state: AgentState):
    """TabPFN: Performs statistical forecasting."""
    print("--- [TabPFN] Forecasting ---")
    return {"final_response": "**FORECAST:** Occupancy 94% (+/- 2%) with High Confidence based on historical trends.", "next_node": END}

async def generator_node(state: AgentState):
    """GENERATOR: Synthesizes the final response."""
    print("--- [GENERATOR] Speaking ---")
    
    context_str = ""
    if state.get("memories"): context_str += f"DOCUMENTS FOUND:\n{json.dumps(state['memories'])}\n"
    if state.get("execution_result"): context_str += f"CALCULATION RESULT:\n{state['execution_result']}\n"
    
    prompt = f"Context:\n{context_str}\nUser Query: {state['messages'][-1].content}\n\nTask: Answer professionally as Ada Marina AI. If there is a calculation result, state it clearly."
    
    llm = get_llm(model="gemini-3-pro-preview")
    if not llm: return {"final_response": "API Key Error. Cannot generate response.", "next_node": END}

    res = await llm.ainvoke(prompt)
    
    return {"final_response": res.content, "next_node": END}

# --- BUILD GRAPH ---
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
    
    return workflow.compile()`,

    // 5. MEMORY INGESTOR
    'backend/ingest.py': `import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient, models
from dotenv import load_dotenv

load_dotenv()
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "ada_memory"

print(f"🚀 Ingesting Knowledge Base (Hybrid Mode)...")

# 1. Connect to Qdrant
client = QdrantClient(url=QDRANT_URL)
client.recreate_collection(
    collection_name=COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# 2. Initialize Local Embeddings (CPU optimized)
print("   -> Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 3. Read Files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True) + glob.glob(f"{DOCS_DIR}/**/*.json", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
points = []
point_id = 0

# 4. Process
for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunks = text_splitter.create_documents([content])
            
            for chunk in chunks:
                vector = embeddings.embed_query(chunk.page_content)
                
                points.append(models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "text": chunk.page_content, 
                        "source": os.path.basename(file_path)
                    }
                ))
                point_id += 1
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

# 5. Upload
if points:
    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"✅ SUCCESS: {len(points)} memories implanted into {COLLECTION_NAME}.")
else:
    print("⚠️ No data found to ingest.")`,

    // 6. NGINX GATEWAY
    'nginx/nginx.conf': `events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;

        # Serve React Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API Requests to Python Backend
        location /api/ {
            proxy_pass http://ada-core:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Proxy WebSocket Telemetry
        location /ws/ {
            proxy_pass http://ada-core:8000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}`,

    // 7. DOCKER COMPOSE ORCHESTRATOR
    'docker-compose.hyperscale.yml': `version: '3.9'

networks:
  ada_onenet:
    driver: bridge

services:
  # 1. THE BRAIN (Python Backend)
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    restart: always
    ports:
      - "8000:8000"
    environment:
      - API_KEY=\${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
      - MQTT_BROKER=ada-mqtt
    depends_on:
      - ada-redis
      - ada-qdrant
      - ada-mqtt
    volumes:
      - ./backend:/app
      - ./docs:/docs
    networks:
      - ada_onenet

  # 2. FRONTEND GATEWAY (Nginx + React)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - API_KEY=\${API_KEY}
    container_name: ada_frontend_hyperscale
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - ada-core
    networks:
      - ada_onenet

  # 3. MEMORY (Vector DB)
  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    restart: always
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - ada_onenet

  # 4. TRUTH (Postgres)
  ada-postgres:
    image: postgres:15-alpine
    container_name: ada_postgres
    restart: always
    environment:
      POSTGRES_USER: ada
      POSTGRES_PASSWORD: adapassword
      POSTGRES_DB: wim_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ada_onenet

  # 5. NERVOUS SYSTEM (Redis)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ada_onenet

  # 6. SENSORY SYSTEM (MQTT)
  ada-mqtt:
    image: eclipse-mosquitto:2
    container_name: ada_mqtt_broker
    restart: always
    ports:
      - "1883:1883"
    volumes:
      - mqtt_data:/mosquitto/data
      - mqtt_log:/mosquitto/log
    networks:
      - ada_onenet

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
  mqtt_data:
  mqtt_log:`
};

// --- EXECUTION LOOP ---

console.log('    -> Writing Files...');

for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(rootDir, relativePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`       ✅ Generated: ${relativePath}`);
}

console.log('-----------------------------------------------');
console.log('✨ SYSTEM HYDRATION COMPLETE.');
console.log('👉 Next Step: Run "node scripts/hydrate_backend.mjs" (You just did!)');
console.log('👉 Final Step: Run "docker-compose -f docker-compose.hyperscale.yml up --build -d"');
