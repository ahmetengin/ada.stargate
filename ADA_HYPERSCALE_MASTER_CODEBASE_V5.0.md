
# ⚓️ ADA STARGATE: HYPERSCALE MASTER CODEBASE (v5.0 - COGNITIVE ENTITY)

**Architect:** Ada Core Team
**Version:** 5.0 (Cognitive Entity - MAKER Activated)
**Status:** Ready for Deployment (via Manual Copy-Paste)

This file contains the **complete source code** required to upgrade Ada from a frontend simulation to a **Cognitive Operating System**.

**ÖNEMLİ:** Bu dosyada yer alan kod blokları, sistem kısıtlamaları nedeniyle doğrudan `.py`, `.conf` veya `.sh` uzantılarıyla oluşturulamamıştır. Lütfen her kod bloğunun başındaki `Dosya Yolu: [path]` talimatını izleyerek ilgili dosyanın içeriğini manuel olarak kopyalayıp doğru yere kaydedin.

---

## 🛠️ 1. INFRASTRUCTURE (ALTYAPI)

### Dosya Yolu: `docker-compose.hyperscale.yml`
Bu dosya, tüm Ada Stargate bileşenlerini (Frontend, Python Backend, Qdrant, Redis, PostgreSQL, Ollama, MQTT Broker) bir araya getirip yönetir.

```yaml
version: '3.9'

services:
  # 1. THE BRAIN (Python LangGraph + MAKER + SEAL)
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    ports:
      - "8000:8000" # Ana API
    environment:
      - API_KEY=${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
      - MQTT_BROKER=ada-mqtt
      - OLLAMA_URL=http://ada-local-llm:11434 # Yerel LLM için
    depends_on:
      - ada-redis
      - ada-qdrant
      - ada-mqtt
      - ada-local-llm # Yerel LLM bağımlılığı
    volumes:
      - ./backend:/app # Backend kodları
      - ./docs:/docs   # RAG için dokümanlar
    restart: always

  # 2. MEMORY (Vector DB - Uzun Süreli Hafıza - RAG)
  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    ports:
      - "6333:6333" # Qdrant API portu
    volumes:
      - qdrant_data:/qdrant/storage # Veri kalıcılığı için

  # 3. LOCAL BRAIN (Ollama - Çevrimdışı Zeka - Google Gemma)
  ada-local-llm:
    image: ollama/ollama:latest
    container_name: ada_local_llm
    ports:
      - "11434:11434" # Ollama API portu
    volumes:
      - ollama_data:/root/.ollama # Model kalıcılığı için
    restart: always

  # 4. TRUTH (Relational DB - Kesin Gerçekler - PostgreSQL)
  ada-postgres:
    image: postgres:15-alpine
    container_name: ada_postgres
    environment:
      POSTGRES_USER: ada
      POSTGRES_PASSWORD: adapassword
      POSTGRES_DB: wim_db
    ports:
      - "5432:5432" # PostgreSQL portu
    volumes:
      - postgres_data:/var/lib/postgresql/data # Veri kalıcılığı için

  # 5. NERVOUS SYSTEM (Event Bus - Kısa Süreli Hafıza - Redis)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379" # Redis portu
    volumes:
      - redis_data:/data # Veri kalıcılığı için

  # 6. SENSORY SYSTEM (IoT Broker - MQTT)
  ada-mqtt:
    image: eclipse-mosquitto:2
    container_name: ada_mqtt_broker
    ports:
      - "1883:1883" # MQTT standart portu
      - "9001:9001" # MQTT WebSocket portu
    volumes:
      - mqtt_data:/mosquitto/data
      - mqtt_log:/mosquitto/log

  # 7. FRONTEND (React Interface - Görev Kontrol)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ada_frontend_hyperscale
    ports:
      - "3000:80" # Mac M3 uyumluluğu için 80 yerine 3000 portu
    environment:
      - API_KEY=${API_KEY} # API anahtarı frontend için
    depends_on:
      - ada-core # Backend'e bağımlı

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
  mqtt_data:
  mqtt_log:
  ollama_data: # Ollama modelleri için yeni volume
```

### Dosya Yolu: `backend/Dockerfile`
Python backend için temel Docker imajı ve bağımlılıkların kurulumu.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları (gerekirse)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🐍 2. THE BRAIN (PYTHON BACKEND)

### Dosya Yolu: `backend/requirements.txt`
```text
fastapi
uvicorn
pydantic
python-dotenv
google-genai
langgraph
langchain-core
langchain-community
langchain-google-genai
langchain-huggingface
langchain-text-splitters
qdrant-client
ollama
# RAG
markdown
beautifulsoup4
# Diğer
redis
asyncpg
pandas
scikit-learn
paho-mqtt
```

### Dosya Yolu: `backend/config.py`
Merkezi konfigürasyon dosyası.

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv("API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL", "http://ada-qdrant:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://ada-redis:6379")
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ada-local-llm:11434")
    
    # Cloud Models
    SMART_MODEL = "gemini-3-pro-preview"
    
    # Local Models
    OFFLINE_MODEL = "gemma:2b"
    OFFLINE_EMBEDDING = "all-MiniLM-L6-v2"
    
    COLLECTION_NAME = "ada_memory"

    @staticmethod
    def validate():
        if not Config.API_KEY:
            print("⚠️ WARNING: API_KEY is missing. System will default to OFFLINE mode.")

Config.validate()
```

### Dosya Yolu: `backend/schemas.py`
API veri modelleri.

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    prompt: str
    user_role: str = "GUEST"
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
```

### Dosya Yolu: `backend/ingest.py`
Ada'nın öğrenme modülü (Hafıza Yaratıcı).

```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings # Local
from qdrant_client import QdrantClient, models

try:
    from backend.config import Config
except ImportError:
    from config import Config

DOCS_DIR = "../docs"

print(f"🚀 Ingesting Knowledge Base (Hybrid Mode)...")

client = QdrantClient(url=Config.QDRANT_URL)
client.recreate_collection(
    collection_name=Config.COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

print("   -> Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name=Config.OFFLINE_EMBEDDING)

files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
points = []

for idx, file_path in enumerate(files):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunks = text_splitter.create_documents([content])
            
            for i, chunk in enumerate(chunks):
                vector = embeddings.embed_query(chunk.page_content)
                points.append(models.PointStruct(
                    id=idx * 10000 + i,
                    vector=vector,
                    payload={"text": chunk.page_content, "source": os.path.basename(file_path)}
                ))
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

if points:
    client.upsert(collection_name=Config.COLLECTION_NAME, points=points, wait=True)
    print(f"✅ SUCCESS: {len(points)} hybrid memories implanted.")
```

### Dosya Yolu: `backend/architecture_graph.py`
LangGraph ile Ada'nın beyni.

```python
import operator
import re
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.chat_models import ChatOllama
from qdrant_client import QdrantClient

try:
    from backend.config import Config
except ImportError:
    from config import Config

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    intent: str
    next_node: str
    generated_code: str
    execution_result: str
    memories: List[str]
    final_response: str

def get_llm():
    if Config.API_KEY:
        return ChatGoogleGenerativeAI(model=Config.SMART_MODEL, google_api_key=Config.API_KEY, temperature=0.1)
    print("⚠️ Using Local LLM (Gemma)")
    return ChatOllama(model=Config.OFFLINE_MODEL, base_url=Config.OLLAMA_URL)

async def router_node(state: AgentState):
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg} ---")
    if any(x in msg for x in ["calculate", "solve", "math", "hesapla"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    if any(x in msg for x in ["rule", "law", "contract", "kural"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    print("--- [MAKER] Writing Code ---")
    query = state['messages'][-1].content
    prompt = f"Write a Python script to solve: {query}. Output ONLY code inside ```python``` blocks. Use print() for output."
    llm = get_llm()
    res = await llm.ainvoke(prompt)
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    try:
        import math, datetime, json, random, io, sys
        safe_globals = {"math": math, "datetime": datetime, "json": json, "random": random}
        old_stdout, sys.stdout = sys.stdout, io.StringIO()
        exec(code, safe_globals)
        result = sys.stdout.getvalue().strip()
        sys.stdout = old_stdout
        return {"execution_result": result or "No output.", "next_node": "generator"}
    except Exception as e:
        return {"execution_result": f"Error: {e}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=Config.QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name=Config.OFFLINE_EMBEDDING)
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name=Config.COLLECTION_NAME, query_vector=vector, limit=2)
        memories = [hit.payload["text"] for hit in hits] or ["No documents found."]
    except Exception as e:
        memories = [f"Memory offline: {e}"]
    return {"memories": memories, "next_node": "generator"}

async def generator_node(state: AgentState):
    print("--- [GENERATOR] Speaking ---")
    context = ""
    if state.get("memories"): context += f"RULES:\n{state['memories']}\n"
    if state.get("execution_result"): context += f"CALCULATION:\n{state['execution_result']}\n"
    prompt = f"Context:\n{context}\nUser: {state['messages'][-1].content}\nAnswer:"
    llm = get_llm()
    res = await llm.ainvoke(prompt)
    return {"final_response": res.content, "next_node": END}

def build_graph():
    workflow = StateGraph(AgentState)
    nodes = {"router": router_node, "maker_agent": maker_agent_node, "executor": executor_node, "rag_retriever": rag_retriever_node, "generator": generator_node}
    for name, node in nodes.items():
        workflow.add_node(name, node)
    
    workflow.set_entry_point("router")
    workflow.add_conditional_edges("router", lambda x: x["next_node"], {"maker_agent": "maker_agent", "rag_retriever": "rag_retriever", "generator": "generator"})
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    return workflow.compile()
```

### Dosya Yolu: `backend/main.py`
API sunucusu.

```python
import uvicorn
import subprocess
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage

try:
    from backend.architecture_graph import build_graph
    from backend.schemas import ChatRequest
except ImportError:
    from architecture_graph import build_graph
    from schemas import ChatRequest

app = FastAPI(title="Ada Cognitive API", version="5.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

brain_graph = build_graph()

@app.get("/health")
def health():
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "MAKER", "RAG"]}

def run_ingestion_task():
    try:
        print("Background ingestion started...")
        subprocess.run(["python", "ingest.py"], check=True, cwd="/app")
        print("Ingestion task completed.")
    except Exception as e:
        print(f"Ingestion failed: {e}")

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        inputs = {"messages": [HumanMessage(content=request.prompt)]}
        final_state = await brain_graph.ainvoke(inputs)
        return {"text": final_state.get("final_response", "Error"), "traces": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🏔️ 3. ÇEVRİMDIŞI KURULUM (MOUNTAIN MODE)

### Dosya Yolu: `offline_setup.sh`
Bu script, sistemi internet olmadan çalıştırmak için gereken modelleri önceden indirir.

```bash
#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}>>> ADA STARGATE: SURVIVAL KIT INSTALLER <<<${NC}"

# 1. Start services
echo -e "\n${BLUE}[1/3] Starting essential services...${NC}"
docker-compose -f docker-compose.hyperscale.yml up -d ada-local-llm ada-qdrant ada-core
sleep 15

# 2. Download local LLM
echo -e "\n${BLUE}[2/3] Downloading local brain (Gemma 2B)...${NC}"
docker exec -it ada_local_llm ollama pull gemma:2b
if [ $? -ne 0 ]; then echo -e "${RED}Failed to pull Gemma.${NC}"; exit 1; fi

# 3. Download local embeddings
echo -e "\n${BLUE}[3/3] Caching memory models (Embeddings)...${NC}"
docker exec -it ada_core_hyperscale python -c "from langchain_community.embeddings import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')"
if [ $? -ne 0 ]; then echo -e "${RED}Failed to cache embeddings.${NC}"; exit 1; fi

echo -e "\n${GREEN}✅ MOUNTAIN MODE READY. You can now operate offline.${NC}"
```

---

## 📘 4. KULLANIM KILAVUZU

### Dosya Yolu: `USER_MANUAL.md`
```markdown
# 📘 Ada Stargate: Hyperscale User Manual v5.0

## 1. Introduction: The Cognitive OS
Ada is a Cognitive Operating System. It thinks, learns, and creates.
- **LangGraph**: The Orchestrator (Decision Maker).
- **MAKER**: The Tool Maker (Writes Python code).
- **RAG**: The Memory (Remembers your documents).
- **Ollama**: The Local Brain (Works without internet).

## 2. Quick Start
1. **(One Time Only)** Setup Offline Mode:
   ```bash
   bash offline_setup.sh
   ```
2. **Start System:**
   ```bash
   docker-compose -f docker-compose.hyperscale.yml up --build -d
   ```
3. **Teach Ada:** (After adding/changing files in `docs/`)
   ```bash
   curl -X POST http://localhost:8000/api/v1/learn
   ```

## 3. How to Interact
- **Ask for Information:** "What does COLREGs Rule 15 say?" -> Triggers **RAG**.
- **Ask for Calculation:** "Calculate the fee for a 20m x 5m boat for 3 days." -> Triggers **MAKER**.
- **Ask for General Chat:** "Tell me about West Istanbul Marina." -> Triggers **General** chat.
```
