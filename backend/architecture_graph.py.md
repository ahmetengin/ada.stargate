
```python
import operator
import re
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings # Local
from langchain_community.chat_models import ChatOllama # Local
from qdrant_client import QdrantClient
try:
    from backend.config import Config
except ImportError:
    from config import Config

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

# --- FACTORY ---
def get_llm():
    """Hybrid Factory: Tries Cloud, falls back to Ollama"""
    try:
        if Config.API_KEY:
            return ChatGoogleGenerativeAI(model=Config.SMART_MODEL, google_api_key=Config.API_KEY, temperature=0.1)
    except:
        pass
    
    print("⚠️ Using Local LLM (Gemma)")
    return ChatOllama(model=Config.OFFLINE_MODEL, base_url=Config.OLLAMA_URL)

# --- NODES ---

async def router_node(state: AgentState):
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg} ---")
    
    if any(x in msg for x in ["calculate", "solve", "math", "hesapla"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    if any(x in msg for x in ["rule", "law", "contract", "kural", "yönetmelik"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    print("--- [MAKER] Writing Python Code ---")
    query = state['messages'][-1].content
    prompt = f"Write Python code to solve: {query}. Output ONLY code inside ```python``` blocks. Use print() for output."
    
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
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        try:
            exec(code, safe_globals)
        except Exception as e:
            print(f"Runtime Error: {e}")
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        if not result: result = "No output."
        return {"execution_result": result, "next_node": "generator"}
    except Exception as e:
        return {"execution_result": f"Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """
    Hybrid RAG: Uses Local Embeddings to search Qdrant (works offline).
    """
    print("--- [RAG] Searching Memory (Local Embeddings) ---")
    try:
        client = QdrantClient(url=Config.QDRANT_URL)
        # MUST use the same model as ingest.py
        embeddings = HuggingFaceEmbeddings(model_name=Config.OFFLINE_EMBEDDING)
        vector = embeddings.embed_query(state['messages'][-1].content)
        
        hits = client.search(collection_name=Config.COLLECTION_NAME, query_vector=vector, limit=2)
        memories = [hit.payload["text"] for hit in hits]
        
        if not memories: memories = ["No documents found."]
    except Exception as e:
        print(f"RAG Error: {e}")
        memories = ["Memory offline."]
        
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
        {"maker_agent": "maker_agent", "rag_retriever": "rag_retriever", "generator": "generator"}
    )
    
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    
    return workflow.compile()
```
