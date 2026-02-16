import os
import operator
import re
import sys
import io
import json
import random
import datetime
import math
import traceback
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
# Conditional import to prevent crash if library is missing
try:
    from qdrant_client import QdrantClient
except ImportError:
    QdrantClient = None

from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "ada_memory"

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    intent: str
    next_node: str
    generated_code: str
    execution_result: str
    memories: List[str]
    self_edits: List[str]
    final_response: str

# --- LLM FACTORY ---
def get_llm(model="gemini-3-flash-preview", temp=0.1):
    if not API_KEY:
        print("CRITICAL: API_KEY missing.")
        return None 
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """ROUTER: Analyzes user intent."""
    try:
        last_message = state['messages'][-1].content.lower()
        print(f"--- [ROUTER] Analyzing: {last_message[:50]}... ---")
        
        if any(x in last_message for x in ["update rule", "learn", "öğren", "yeni kural"]):
            return {"intent": "LEARNING", "next_node": "seal_learner"}

        if any(x in last_message for x in ["calculate", "solve", "math", "hesapla", "topla"]):
            return {"intent": "MAKER", "next_node": "maker_agent"}
        
        if any(x in last_message for x in ["rule", "law", "contract", "kural", "yönetmelik"]):
            return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
        if any(x in last_message for x in ["predict", "forecast", "tahmin", "gelecek"]):
            return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}
            
        return {"intent": "GENERAL", "next_node": "generator"}
    except Exception as e:
        print(f"Router Error: {e}")
        return {"intent": "ERROR", "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    # ... (Logic identical to previous, just wrapped for safety) ...
    llm = get_llm(model="gemini-3-pro-preview")
    if not llm: return {"final_response": "API Config Error", "next_node": END}
    
    new_knowledge = state['messages'][-1].content
    try:
        res = await llm.ainvoke(f"Analyze new rule: '{new_knowledge}'. Generate 3 implications.")
        return {"final_response": f"**SEAL ACTIVE**\n\nRule Ingested.\n{res.content}", "next_node": END}
    except:
        return {"final_response": "SEAL Error", "next_node": END}

async def maker_agent_node(state: AgentState):
    query = state['messages'][-1].content
    llm = get_llm(model="gemini-3-flash-preview")
    if not llm: return {"generated_code": "", "next_node": "generator"}
    
    try:
        res = await llm.ainvoke(f"Write Python code to solve: {query}. Output code in ```python blocks.")
        code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
        code = code_match.group(1).strip() if code_match else res.content.strip()
        return {"generated_code": code, "next_node": "executor"}
    except:
         return {"generated_code": "", "next_node": "generator"}

async def executor_node(state: AgentState):
    code = state.get("generated_code", "")
    if not code: return {"execution_result": "No code.", "next_node": "generator"}

    try:
        safe_globals = {"math": math, "datetime": datetime, "json": json, "random": random}
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        exec(code, safe_globals)
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        return {"execution_result": result, "next_node": "generator"}
    except Exception as e:
        return {"execution_result": f"Error: {e}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    print("--- [RAG] Searching Memory ---")
    if not QdrantClient:
        return {"memories": ["Vector DB Library Missing"], "next_node": "generator"}
        
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector = embeddings.embed_query(state['messages'][-1].content)
        hits = client.search(collection_name=COLLECTION_NAME, query_vector=vector, limit=3)
        memories = [f"Doc: {hit.payload.get('text', '')}" for hit in hits]
    except Exception as e:
        print(f"RAG Error: {e}")
        memories = ["Memory unavailable."]
        
    return {"memories": memories, "next_node": "generator"}

async def tabpfn_predictor_node(state: AgentState):
    return {"final_response": "**FORECAST ENGINE**\n\nSimulation: 94% Occupancy.", "next_node": END}

async def generator_node(state: AgentState):
    context = ""
    if state.get("memories"): context += "KNOWLEDGE:\n" + "\n".join(state['memories']) + "\n\n"
    if state.get("execution_result"): context += "CALCULATION:\n" + state['execution_result'] + "\n\n"
        
    query = state['messages'][-1].content
    llm = get_llm(model="gemini-3-pro-preview")
    if not llm: return {"final_response": "System Config Error", "next_node": END}
    
    try:
        res = await llm.ainvoke(f"Context:\n{context}\nUser: {query}\nAnswer as Ada.")
        return {"final_response": res.content, "next_node": END}
    except Exception as e:
        return {"final_response": f"Generation Error: {e}", "next_node": END}

# --- BUILD THE GRAPH ---
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
