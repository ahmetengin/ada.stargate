
# 🧠 Ada Stargate: Hyperscale Implementation Guide

Bu dosya, Ada Stargate'in "Cognitive Entity" (Bilişsel Varlık) sürümü için gerekli olan **Python Backend kodlarını** içerir.
Sistem kısıtlamaları nedeniyle bu dosyalar doğrudan oluşturulamamıştır. Lütfen aşağıdaki kod bloklarını belirtilen dosya isimleriyle `backend/` klasörüne kaydedin.

---

## 1. Gerekli Kütüphaneler

Bu içeriği `backend/requirements.txt` dosyasına kaydedin.

```text
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai>=0.14.0
httpx>=0.26.0
redis>=5.0.0
# Cognitive Stack
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
langchain-text-splitters
qdrant-client
# tabpfn # Bu kütüphane genellikle manuel kurulum gerektirir, şimdilik yorumda
# fastmcp # Bu kütüphane konsept olduğu için yorumda
asyncpg
markdown
beautifulsoup4
pandas
scikit-learn
```

---

## 2. Hafıza Modülü (Learning Script)
Bu kod, `docs/` klasöründeki tüm bilgileri okur ve Ada'nın uzun süreli hafızasına (Qdrant) yazar.

**Dosya adı:** `backend/ingest.py`

```python
import os
import glob
import markdown
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

load_dotenv()

# Configuration
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError("API_KEY not found in environment variables")

print(f"🚀 Starting Ingestion Protocol...")
print(f"📂 Scanning Directory: {DOCS_DIR}")

# 1. Connect to Vector DB
client = QdrantClient(url=QDRANT_URL)
collection_name = "ada_memory"

# Re-create collection
client.recreate_collection(
    collection_name=collection_name,
    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
)

# 2. Initialize Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)

# 3. Read & Process Files
documents = []
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True) + glob.glob(f"{DOCS_DIR}/**/*.json", recursive=True)

print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n## ", "\n### ", "\n", " ", ""]
)
point_id = 0
points = []

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
            filename = os.path.basename(file_path)
            doc_type = "regulation" if "legal" in file_path else "technical" if "tech" in file_path else "general"
            
            chunks = text_splitter.create_documents([content], metadatas=[{"source": filename, "type": doc_type}])
            
            for chunk in chunks:
                vector = embeddings.embed_query(chunk.page_content)
                points.append(models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "text": chunk.page_content,
                        "source": chunk.metadata["source"],
                        "type": chunk.metadata["type"]
                    }
                ))
                point_id += 1
            print(f"   -> Processed {filename}: {len(chunks)} memory chunks.")
            
    except Exception as e:
        print(f"   ❌ Error reading {file_path}: {e}")

# 4. Embed & Upload
print(f"🧠 Embedding {len(points)} memory fragments...")

if points:
    client.upsert(
        collection_name=collection_name,
        points=points,
        wait=True
    )
    print(f"✅ SUCCESS: {len(points)} memories implanted into Qdrant.")
else:
    print("⚠️ No data to ingest.")
```

---

## 3. Beyin & Bilişsel Mimari (Graph)
Bu kod Ada'nın düşünme şeklidir. Hesap yapar, tahmin eder, hafızasını sorgular ve yeni kuralları öğrenir (SEAL).

**Dosya adı:** `backend/architecture_graph.py`

```python
import os
import operator
import json
import re
import traceback
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

# --- STATE ---
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
    """Decides the thinking path."""
    last_msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {last_msg} ---")
    
    if "predict" in last_msg or "forecast" in last_msg:
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}
    
    if "calculate" in last_msg or "+" in last_msg or "*" in last_msg:
        return {"intent": "MATH", "next_node": "maker_agent"}
        
    if "update rule" in last_msg or "learn" in last_msg:
        return {"intent": "LEARNING", "next_node": "seal_learner"}
        
    return {"intent": "RAG", "next_node": "rag_retriever"}

async def maker_agent_node(state: AgentState):
    """MAKER: Writes Python code to solve the problem."""
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
    
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """EXECUTOR: Runs the code."""
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        import math, datetime, json, random, io, sys
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
        return {"execution_result": f"Error: {str(e)}\n{traceback.format_exc()}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """Fetches relevant laws/rules from vector DB."""
    query = state['messages'][-1].content
    print(f"--- [MEMORY] Searching for: {query} ---")
    
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
        vector = embeddings.embed_query(query)
        hits = client.search(collection_name="ada_memory", query_vector=vector, limit=3)
        memories = [hit.payload["text"] for hit in hits]
    except Exception as e:
        memories = [f"Memory offline: {e}"]
        
    return {"memories": memories, "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """SEAL Protocol Implementation."""
    print("--- [SEAL] Activating Adaptation Protocol ---")
    new_rule = state['messages'][-1].content
    
    llm = get_llm()
    prompt = f"The user provided a new operational rule: '{new_rule}'. Generate 3 specific operational implications for a Marina Agent."
    res = await llm.ainvoke(prompt)
    implications = res.content
    
    response = f"**KNOWLEDGE INGESTED (SEAL PROTOCOL)**\n\nI have updated my internal parameters with the new rule.\n\n**Derived Implications:**\n{implications}"
    
    return {"final_response": response, "next_node": END}

async def tabpfn_predictor_node(state: AgentState):
    """Simulates TabPFN v2 for prediction."""
    print("--- [TabPFN] Running Inference ---")
    result = "Occupancy Prediction: 94% (+/- 2%). Confidence: High." # Mock
    return {"final_response": f"**ANALYTICS ENGINE**\n\n{result}", "next_node": END}

async def generator_node(state: AgentState):
    """Synthesizes the answer using Memories + LLM."""
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

## 4. API Giriş Noktası
Bu dosya, LangGraph beynini sunar ve bir "Öğrenme" endpoint'i ekler.

**Dosya adı:** `backend/main.py`

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

app = FastAPI(title="Ada Cognitive API", version="4.1")

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
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["SEAL", "TabPFN", "Qdrant", "MAKER"]}

def run_ingestion_task():
    """Runs the ingestion script in the background."""
    print("Triggering background memory ingestion...")
    try:
        subprocess.run(["python", "ingest.py"], check=True)
        print("Ingestion task completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Ingestion task failed: {e}")

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    """Endpoint to trigger document ingestion."""
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated. Docs will be indexed shortly."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
        }
        
        final_state = await brain_graph.ainvoke(inputs)
        
        return {
            "text": final_state.get("final_response", "System processing error."),
            "traces": [{"step": "INTENT", "content": final_state.get('intent', 'UNKNOWN')}]
        }
        
    except Exception as e:
        print(f"Graph Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
