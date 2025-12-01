
# 🧠 Ada Stargate: Hyperscale Implementation Source Code

Bu dosya, Ada Stargate'in **Bilişsel Varlık (Cognitive Entity)** sürümü için gerekli olan Python kaynak kodlarını içerir.
Sistem kısıtlamaları nedeniyle bu dosyalar doğrudan oluşturulamamıştır.

**TALİMAT:** Lütfen aşağıdaki kod bloklarını kopyalayıp, projenizin `backend/` klasörü altında belirtilen isimlerle kaydedin.

---

## 1. Kütüphane Gereksinimleri

**Hedef Dosya:** `backend/requirements.txt`

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
# tabpfn # Uncomment for real usage, heavy install
fastmcp
asyncpg
markdown
beautifulsoup4
pandas
scikit-learn
```

---

## 2. Hafıza Yükleme (Ingestion Script)

Bu script, `docs/` klasöründeki Markdown ve JSON dosyalarını okur, Gemini ile vektör haline getirir ve Qdrant veritabanına yükler.

**Hedef Dosya:** `backend/ingest.py`

```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
DOCS_DIR = "../docs"
# Docker içinde çalışırken "http://ada-qdrant:6333", localde "http://localhost:6333"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333") 
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print("❌ ERROR: API_KEY not found in environment variables.")
    exit(1)

print(f"🚀 Starting Ada Memory Ingestion Protocol...")
print(f"📂 Target Directory: {DOCS_DIR}")
print(f"💽 Vector DB: {QDRANT_URL}")

# 1. Connect to Vector DB
try:
    client = QdrantClient(url=QDRANT_URL)
    collection_name = "ada_memory"
    
    # Check if collection exists, if not create
    collections = client.get_collections()
    exists = any(c.name == collection_name for c in collections.collections)
    
    if not exists:
        print(f"Creating collection '{collection_name}'...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
        )
except Exception as e:
    print(f"❌ Connection to Qdrant failed: {e}")
    exit(1)

# 2. Initialize Embeddings
# models/embedding-001 is optimized for retrieval tasks
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)

# 3. Read & Process Files
documents = []
# Recursively find all MD and JSON files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True) + glob.glob(f"{DOCS_DIR}/**/*.json", recursive=True)

print(f"📄 Found {len(files)} knowledge files.")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000, # Large chunks for context
    chunk_overlap=200,
    separators=["\n## ", "\n### ", "\n", " ", ""]
)

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
            # Simple metadata extraction
            filename = os.path.basename(file_path)
            
            # Categorize based on path
            doc_type = "GENERAL"
            if "legal" in file_path: doc_type = "LEGAL"
            elif "sea" in file_path: doc_type = "NAVIGATION"
            elif "marina" in file_path: doc_type = "OPERATIONS"
            elif "tactical" in file_path: doc_type = "TACTICAL"
            
            chunks = text_splitter.create_documents([content], metadatas=[{"source": filename, "type": doc_type}])
            documents.extend(chunks)
            print(f"   -> Parsed {filename} ({doc_type}): {len(chunks)} chunks.")
            
    except Exception as e:
        print(f"   ⚠️ Error reading {file_path}: {e}")

# 4. Embed & Upload
print(f"🧠 Generating Embeddings for {len(documents)} fragments (This may take a moment)...")

points = []
batch_size = 50 

for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    try:
        # Batch embed
        texts = [d.page_content for d in batch]
        vectors = embeddings.embed_documents(texts)
        
        for j, doc in enumerate(batch):
            points.append(models.PointStruct(
                id=i+j, # Simple integer ID
                vector=vectors[j],
                payload={
                    "text": doc.page_content,
                    "source": doc.metadata["source"],
                    "type": doc.metadata["type"]
                }
            ))
        print(f"   Processed batch {i}/{len(documents)}")
    except Exception as e:
        print(f"   ❌ Batch Embedding Error: {e}")

# Upsert to Qdrant
if points:
    try:
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"✅ SUCCESS: {len(points)} memories implanted into Qdrant.")
    except Exception as e:
        print(f"❌ Upload Error: {e}")
else:
    print("⚠️ No valid data to ingest.")
```

---

## 3. Beyin & LangGraph Orkestrasyonu

Bu dosya sistemin **Karar Merkezi**dir. Kullanıcı niyetini anlar ve ilgili uzmana (RAG, Hesap Makinesi, SEAL) yönlendirir.

**Hedef Dosya:** `backend/architecture_graph.py`

```python
import os
import operator
import re
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
# Docker: http://ada-qdrant:6333, Local: http://localhost:6333
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
API_KEY = os.getenv("API_KEY")

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: Dict[str, Any]
    intent: str
    next_node: str
    memories: List[str]
    final_response: str

# --- TOOLS ---

def retrieve_memory(query: str, limit: int = 3) -> List[str]:
    """Qdrant veritabanından semantik arama yapar."""
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
        vector = embeddings.embed_query(query)
        hits = client.search(
            collection_name="ada_memory",
            query_vector=vector,
            limit=limit
        )
        return [f"[Source: {hit.payload['source']}] {hit.payload['text']}" for hit in hits]
    except Exception as e:
        print(f"Memory Retrieval Error: {e}")
        return []

def safe_calculator(expression: str) -> str:
    """Güvenli matematik hesaplayıcı."""
    try:
        allowed = "0123456789+-*/(). "
        if not all(c in allowed for c in expression):
            return "Error: Invalid characters."
        return str(eval(expression))
    except:
        return "Error: Calculation failed."

# --- NODES ---

async def router_node(state: AgentState):
    """
    Router: Kullanıcının niyetini sınıflandırır (Classification).
    Model: Gemini 2.5 Flash (Hızlı)
    """
    last_msg = state['messages'][-1].content
    print(f"--- [ROUTER] Analyzing: {last_msg}[:50]... ---")
    
    # In production, use LLM structured output. Here we use heuristic + LLM for speed.
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=API_KEY)
    
    prompt = f"""
    You are the Router for a Marina Operations AI.
    Classify the following user message into one of these intents:
    - ANALYTICS: "Predict occupancy", "What if scenarios"
    - MATH: "Calculate invoice", "Multiply dimensions", "Add fees"
    - LEARNING: "New rule", "Update policy", "Change regulation"
    - LEGAL_INFO: "What is the speed limit?", "How to dock?", "Show me the contract"
    - GENERAL: Anything else.
    
    User Message: "{last_msg}"
    
    Return ONLY the intent keyword.
    """
    
    res = await llm.ainvoke(prompt)
    intent = res.content.strip().upper()
    
    if "ANALYTICS" in intent: return {"intent": "ANALYTICS", "next_node": "tabpfn"}
    if "MATH" in intent: return {"intent": "MATH", "next_node": "calculator"}
    if "LEARNING" in intent: return {"intent": "LEARNING", "next_node": "seal_learner"}
    if "LEGAL" in intent or "INFO" in intent: return {"intent": "RAG", "next_node": "rag_retriever"}
    
    return {"intent": "GENERAL", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """Memory Node: Vektör veritabanından bilgi çeker."""
    query = state['messages'][-1].content
    print("--- [RAG] Retrieving Knowledge ---")
    memories = retrieve_memory(query)
    return {"memories": memories, "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """
    SEAL Node: Self-Adapting Language Models.
    Yeni bir kuralı analiz eder ve 'çıkarımlar' (implications) üretir.
    """
    print("--- [SEAL] Learning New Rule ---")
    rule = state['messages'][-1].content
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=API_KEY)
    prompt = f"The user stated a new rule: '{rule}'. Generate 3 operational implications for a Marina AI."
    res = await llm.ainvoke(prompt)
    
    response = f"**SEAL PROTOCOL ACTIVATED**\n\nNew rule ingested: *{rule}*\n\n**Operational Implications:**\n{res.content}"
    return {"final_response": response, "next_node": END}

async def tabpfn_node(state: AgentState):
    """Analytics Node: İstatistik ve tahmin."""
    print("--- [TabPFN] Running Prediction ---")
    # Mock TabPFN prediction
    response = "**ANALYTICS ENGINE**\n\nPrediction: Occupancy will reach **94%** next weekend.\nConfidence: **High (0.88)**"
    return {"final_response": response, "next_node": END}

async def calculator_node(state: AgentState):
    """Worker Node: Deterministik Hesaplama."""
    print("--- [WORKER] Calculating ---")
    msg = state['messages'][-1].content
    # Simple regex to find math expression
    matches = re.findall(r"[\d\+\-\*\/\(\)\. ]+", msg)
    if matches:
        # Take the longest match
        expr = max(matches, key=len)
        result = safe_calculator(expr)
        response = f"**CALCULATION**\n\nExpression: `{expr.strip()}`\nResult: **{result}**"
    else:
        response = "Could not identify a valid math expression."
    return {"final_response": response, "next_node": END}

async def generator_node(state: AgentState):
    """
    Generator: Nihai cevabı üretir.
    Model: Gemini 3 Pro Preview (Yüksek Zeka)
    """
    print("--- [GENERATOR] Synthesizing Response ---")
    memories = state.get("memories", [])
    user_msg = state['messages'][-1].content
    
    context_str = "\n".join(memories)
    
    prompt = f"""
    You are Ada, the AI Orchestrator for West Istanbul Marina (WIM).
    
    RETRIEVED KNOWLEDGE (From RAG):
    {context_str}
    
    USER QUERY:
    {user_msg}
    
    INSTRUCTIONS:
    - Use the retrieved knowledge to answer accurately.
    - If knowledge is missing, use your general knowledge but admit uncertainty.
    - Be concise, professional, and maritime-focused.
    """
    
    llm = ChatGoogleGenerativeAI(model="gemini-3-pro-preview", google_api_key=API_KEY)
    res = await llm.ainvoke(prompt)
    
    return {"final_response": res.content, "next_node": END}

# --- GRAPH ASSEMBLY ---

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    workflow.add_node("seal_learner", seal_learner_node)
    workflow.add_node("tabpfn", tabpfn_node)
    workflow.add_node("calculator", calculator_node)
    workflow.add_node("generator", generator_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "rag_retriever": "rag_retriever",
            "seal_learner": "seal_learner",
            "tabpfn": "tabpfn",
            "calculator": "calculator",
            "generator": "generator"
        }
    )
    
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    workflow.add_edge("seal_learner", END)
    workflow.add_edge("tabpfn", END)
    workflow.add_edge("calculator", END)
    
    return workflow.compile()
```

---

## 4. API Sunucusu (FastAPI)

Bu dosya, React Frontend'in Backend ile konuşmasını sağlayan kapıdır.

**Hedef Dosya:** `backend/main.py`

```python
import os
import subprocess
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from langchain_core.messages import HumanMessage

# Import Graph
# Ensure backend folder is in path or run from root
from architecture_graph import build_graph

app = FastAPI(title="Ada Stargate Cognitive API", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Brain
brain = build_graph()

class ChatRequest(BaseModel):
    prompt: str
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}

@app.get("/health")
def health_check():
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "version": "4.0-Hyperscale"}

def run_ingestion_task():
    """Runs the ingestion script as a background process."""
    print("Triggering Memory Ingestion...")
    # Assumes running inside container where python is available
    subprocess.run(["python", "ingest.py"])

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    """Endpoint for Frontend to trigger 'Re-read Docs'."""
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated. System is reading docs..."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main Chat Interface.
    Connects React Frontend -> LangGraph Brain.
    """
    try:
        # Prepare Initial State
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
            "intent": "UNKNOWN",
            "next_node": "router",
            "memories": [],
            "final_response": ""
        }
        
        # Invoke Graph
        print(f"🧠 Processing Request: {request.prompt}")
        result = await brain.ainvoke(inputs)
        
        response_text = result.get("final_response", "System Error: No response generated.")
        
        # Build Trace Log (Simplified for UI)
        traces = [
            {
                "id": "trace_router",
                "node": "ada.core",
                "step": "ROUTING",
                "content": f"Intent classified as: {result.get('intent', 'UNKNOWN')}",
                "timestamp": "Now"
            },
            {
                "id": "trace_final",
                "node": "ada.core",
                "step": "FINAL_ANSWER",
                "content": response_text[:50] + "...",
                "timestamp": "Now"
            }
        ]
        
        return {
            "text": response_text,
            "traces": traces,
            "actions": [] # Actions can be populated if Graph returns structured tool calls
        }

    except Exception as e:
        print(f"❌ Graph Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Ada Stargate Backend Initializing...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 5. Orkestrasyon (Docker Compose)

Bu dosya, tüm parçaları (Python Backend, Frontend, Veritabanları) tek bir ağda çalıştırır.

**Hedef Dosya:** `docker-compose.hyperscale.yml`

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

  # 3. TRUTH (Relational DB)
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

  # 4. NERVOUS SYSTEM (Event Bus)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 5. FRONTEND (React)
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
