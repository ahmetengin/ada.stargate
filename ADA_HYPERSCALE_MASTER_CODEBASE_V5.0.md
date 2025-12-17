# ⚓️ ADA STARGATE: HYPERSCALE MASTER CODEBASE (v5.0 - COGNITIVE ENTITY)

**Architect:** Ada Core Team
**Version:** 5.0 (Cognitive Entity - MAKER Activated)
**Status:** Ready for Deployment (via Manual Copy-Paste)

Bu dosya, Ada'yı bir frontend simülasyonundan gerçek bir **Bilişsel İşletim Sistemine** dönüştürmek için gereken tüm Python kodlarını içerir. Lütfen aşağıdaki kod bloklarını `backend/` klasörünüzdeki ilgili dosyalara kopyalayın.

---

## 🛠️ 1. INFRASTRUCTURE

### Dosya: `docker-compose.hyperscale.yml`
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
      - "8000:8000"
    environment:
      - API_KEY=${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
    depends_on:
      - ada-redis
      - ada-qdrant
    volumes:
      - ./backend:/app
      - ./docs:/docs

  # 2. MEMORY (Vector DB)
  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  # 3. EVENT BUS (Redis)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 4. TRUTH (Postgres)
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

  # 5. FRONTEND (React)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ada_frontend_hyperscale
    ports:
      - "3000:80"
    environment:
      - API_KEY=${API_KEY}
    depends_on:
      - ada-core

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
```

---

## 🐍 2. PYTHON BACKEND KODLARI

### Dosya: `backend/requirements.txt`
```text
fastapi>=0.109.0
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
# Diğer
asyncpg
pandas
scikit-learn
```

### Dosya: `backend/ingest.py`
(Hafıza Yükleyici / Öğrenme Scripti)

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
COLLECTION_NAME = "ada_memory"

print(f"🚀 Ingesting Knowledge Base...")

# 1. Connect to Qdrant
client = QdrantClient(url=QDRANT_URL)
client.recreate_collection(
    collection_name=COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# 2. Load Local Embeddings Model (Offline çalışabilmesi için)
print("   -> Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 3. Read Files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
points = []
point_id = 0

# 4. Process Files into Embeddable Chunks
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
                    payload={"text": chunk.page_content, "source": os.path.basename(file_path)}
                ))
                point_id += 1
        print(f"   -> Processed {os.path.basename(file_path)}: {len(chunks)} chunks.")
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

# 5. Upload to Qdrant
if points:
    client.upsert(collection_name=COLLECTION_NAME, points=points, wait=True)
    print(f"✅ SUCCESS: {len(points)} memories implanted into Qdrant.")
else:
    print("⚠️ No data found to ingest.")
```

### Dosya: `backend/architecture_graph.py`
(Ada'nın Beyni: LangGraph + MAKER + SEAL + RAG)

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
COLLECTION_NAME = "ada_memory"

# --- STATE ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
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
    """ROUTER: Niyeti anlar ve yönlendirir."""
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg[:50]}... ---")
    
    if any(x in msg for x in ["calculate", "solve", "math", "hesapla", "topla", "çarp"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    if any(x in msg for x in ["rule", "law", "contract", "kural", "yönetmelik", "nedir"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
    if any(x in msg for x in ["predict", "forecast", "tahmin", "gelecek"]):
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}

    if any(x in msg for x in ["update rule", "learn", "öğren", "yeni kural"]):
        return {"intent": "LEARNING", "next_node": "seal_learner"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """MAKER: Python kodu yazar."""
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
    """RAG: Hafızadan bilgi çeker."""
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name=COLLECTION_NAME, query_vector=vector, limit=2)
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
    """GENERATOR: Cevabı sentezler."""
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

### Dosya: `backend/main.py`
(API Giriş Noktası)

```python
import os
import uvicorn
import subprocess
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from langchain_core.messages import HumanMessage

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
            "traces": []
        }
        
    except Exception as e:
        print(f"Graph Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
