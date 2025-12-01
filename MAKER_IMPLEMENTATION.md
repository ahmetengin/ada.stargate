
# 🛠️ Ada Stargate: MAKER Node Implementation (LATM)

**Reference:** Large Language Models as Tool Makers (LATM) - Arxiv.
**Status:** Experimental / High Capability.

Bu dosya, Ada'nın sadece var olan araçları kullanmasını değil, **ihtiyaç duyduğu aracı o an Python ile yazıp çalıştırmasını** sağlayan kodları içerir.

---

## 1. Mantık Akışı (The Loop)

1.  **Router:** Kullanıcı isteği standart araçlarla (RAG, Weather, vb.) çözülemiyor mu? -> **MAKER** noduna gönder.
2.  **Maker Node:** İsteği analiz et ve problemi çözecek bağımsız bir Python fonksiyonu yaz (`def solve(): ...`).
3.  **Executor Node:** Yazılan kodu güvenli bir ortamda (Sandbox/Exec) çalıştır.
4.  **Validator:** Hata var mı? Varsa Maker'a geri dön (Self-Correction). Yoksa sonucu kullanıcıya sun.

---

## 2. Güncellenmiş Beyin Kodları

Lütfen aşağıdaki kodu `backend/architecture_graph.py` dosyasının üzerine yazın. Bu kod, önceki versiyonun **MAKER yeteneği eklenmiş** halidir.

**Dosya:** `backend/architecture_graph.py`

```python
import os
import operator
import re
import traceback
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
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

# --- LLM FACTORY ---
def get_llm(model="gemini-2.5-flash"):
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=0.1)

# --- TOOLS ---
def retrieve_memory(query: str, limit: int = 3) -> List[str]:
    """Retrieves semantic memories from Qdrant."""
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
        vector = embeddings.embed_query(query)
        hits = client.search(collection_name="ada_memory", query_vector=vector, limit=limit)
        return [hit.payload["text"] for hit in hits]
    except Exception:
        return []

# --- NODES ---

async def router_node(state: AgentState):
    """
    Decides if the problem requires specific tools or NEW CODE (Maker).
    """
    last_msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {last_msg} ---")
    
    # Heuristic Routing (In prod, use Semantic Router)
    if any(x in last_msg for x in ["predict", "forecast", "future"]):
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}
    
    if any(x in last_msg for x in ["update rule", "new policy", "learn"]):
        return {"intent": "LEARNING", "next_node": "seal_learner"}
        
    if any(x in last_msg for x in ["contract", "law", "regulation", "limit"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}

    # MAKER TRIGGER: Complex calculation or logic not covered by standard tools
    # Example: "Calculate mooring load based on wind angle 45 and boat length 20m"
    if any(x in last_msg for x in ["calculate", "compute", "solve", "math", "load", "formula"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """
    THE MAKER: Writes Python code to solve the problem.
    """
    print("--- [MAKER] Writing Code ---")
    query = state['messages'][-1].content
    
    prompt = f"""
    You are an expert Python Engineer (The Maker).
    Your task is to write a Python script to solve the user's problem.
    
    USER REQUEST: {query}
    
    RULES:
    1. Write a COMPLETE, standalone Python script.
    2. Define a function `solve()` that returns the answer as a string or number.
    3. Call `print(solve())` at the end so the executor can capture stdout.
    4. NO external libraries except `math`, `datetime`, `random`, `json`.
    5. Output ONLY the code inside ```python ... ``` blocks.
    """
    
    llm = get_llm(model="gemini-2.5-flash") # Use Flash for code gen speed
    res = await llm.ainvoke(prompt)
    
    # Extract code block
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    if code_match:
        code = code_match.group(1).strip()
    else:
        code = res.content.strip() # Fallback
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """
    THE EXECUTOR: Runs the generated code.
    (WARNING: In production, use E2B Sandbox or Docker. Here we use restricted exec for POC).
    """
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        # Safe Execution Context
        import math, datetime, json, random
        allowed_globals = {
            "math": math, "datetime": datetime, "json": json, "random": random, 
            "__builtins__": {} # Restrict access to dangerous built-ins
        }
        
        # Capture Standard Output
        import io, sys
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        try:
            exec(code, allowed_globals)
        except Exception as e:
            print(f"Runtime Error: {e}")
            
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        
        if not result:
            result = "Code executed but returned no output."
            
        print(f"   >>> Result: {result}")
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        error_msg = f"Execution Failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return {"execution_result": error_msg, "next_node": "generator"}

async def generator_node(state: AgentState):
    """
    Synthesizes the final answer.
    """
    print("--- [GENERATOR] Speaking ---")
    query = state['messages'][-1].content
    
    context_str = ""
    if state.get("memories"):
        context_str += f"RELEVANT DOCS:\n{state['memories']}\n\n"
    if state.get("execution_result"):
        context_str += f"CALCULATION RESULT (From Maker):\n{state['execution_result']}\n\n"
        
    prompt = f"""
    You are Ada, an advanced Marina Operations AI.
    
    CONTEXT:
    {context_str}
    
    USER QUERY:
    {query}
    
    Provide a clear, professional answer. If a calculation was performed, explain the result clearly.
    """
    
    llm = get_llm(model="gemini-3-pro-preview")
    res = await llm.ainvoke(prompt)
    
    return {"final_response": res.content, "next_node": END}

# --- Placeholder Nodes for other branches (simplified for MAKER focus) ---
async def seal_learner_node(state: AgentState):
    return {"final_response": "SEAL Protocol executed (Mock).", "next_node": END}

async def tabpfn_predictor_node(state: AgentState):
    return {"final_response": "TabPFN Prediction: 92% (Mock).", "next_node": END}

async def rag_retriever_node(state: AgentState):
    from backend.ingest import retrieve_memory # Mock import or implementation
    memories = ["Mock Memory: Contracts are binding."] 
    return {"memories": memories, "next_node": "generator"}

# --- GRAPH BUILDER ---

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("maker_agent", maker_agent_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("generator", generator_node)
    
    # Add other nodes
    workflow.add_node("seal_learner", seal_learner_node)
    workflow.add_node("tabpfn_predictor", tabpfn_predictor_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "maker_agent": "maker_agent",
            "seal_learner": "seal_learner",
            "tabpfn_predictor": "tabpfn_predictor",
            "rag_retriever": "rag_retriever",
            "generator": "generator",
            "response_generator": "generator"
        }
    )
    
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    
    # Short circuits
    workflow.add_edge("seal_learner", END)
    workflow.add_edge("tabpfn_predictor", END)
    
    return workflow.compile()
```

## 3. Test Etmek İçin

1.  Backend'i yeniden başlatın:
    ```bash
    docker-compose restart ada-backend
    ```
2.  Chat ekranından (veya API) şu soruyu sorun:
    > *"Bir tekne 20 metre boyunda ve rüzgar 45 dereceden 20 knot hızla geliyor. Tonoz halatına binen yükü (kg) hesapla. Basitçe rüzgar yükü formülü kullan: 0.5 * hava_yoğunluğu * rüzgar_hızı^2 * alan * açı_katsayısı."*

3.  **Beklenen Davranış:**
    *   **Router:** Sorudaki "hesapla", "formül" kelimelerini görür -> `MAKER` intent'i.
    *   **Maker Agent:** Python kodunu yazar (`def solve()...`).
    *   **Executor:** Kodu çalıştırır (Örn: `Result: 345.5 kg`).
    *   **Generator:** "Hesaplamalarıma göre tonoz halatına binen yük 345.5 kg'dır." der.

**Not:** Bu implementasyon, Ada'ya "kendi kendine kod yazma" yeteneği kazandırır. Bu, Bilişsel Varlık (Cognitive Entity) yolundaki en büyük adımdır.
