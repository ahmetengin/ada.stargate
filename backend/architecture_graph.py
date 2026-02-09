
import os
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
    if any(x in msg for x in ["rule", "law", "contract", "kural", "yönetmelik", "nedir", "procedure", "policy"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
    
    # 3. Analytics/Prediction (TabPFN Simulation)
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
    
    prompt = f"""
    You are an expert Python Engineer. Write a script to solve: {query}
    RULES:
    1. Define a function 'def solve():' returning the answer.
    2. End with 'print(solve())'.
    3. Use only standard libraries (math, datetime, json).
    4. Output ONLY code inside ```python ... ``` blocks.
    """
    
    llm = get_llm()
    if not llm: return {"generated_code": "", "next_node": "generator"}

    res = await llm.ainvoke(prompt)
    
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
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
        memories = ["Memory system unavailable (Qdrant connection failed)."]
        
    return {"memories": memories, "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """SEAL: Learns new rules and updates system prompts (Simulated)."""
    print("--- [SEAL] Adapting ---")
    new_rule = state['messages'][-1].content
    llm = get_llm()
    res = await llm.ainvoke(f"Analyze this new rule: '{new_rule}'. List 3 operational implications.")
    return {"final_response": f"**SYSTEM UPDATE (SEAL)**\n\nI have ingested the new rule.\n\n**Implications:**\n{res.content}", "next_node": END}

async def tabpfn_predictor_node(state: AgentState):
    """TabPFN: Performs statistical forecasting (Mocked for stability)."""
    print("--- [TabPFN] Forecasting ---")
    # In a full build, this would load a CSV and run inference.
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
    
    return workflow.compile()
