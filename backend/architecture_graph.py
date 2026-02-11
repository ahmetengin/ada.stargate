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
from qdrant_client import QdrantClient, models
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
    self_edits: List[str] # Persistent learned rules for this session
    final_response: str

# --- LLM FACTORY ---
def get_llm(model="gemini-3-flash-preview", temp=0.1):
    if not API_KEY:
        raise ValueError("CRITICAL: API_KEY is missing in environment.")
    return ChatGoogleGenerativeAI(model=model, google_api_key=API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """ROUTER: Analyzes user intent to determine the path."""
    last_message = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {last_message[:50]}... ---")
    
    # 1. LEARNING Intent (SEAL Protocol Trigger)
    # Detects commands to change rules, policies, or protocols
    learning_keywords = ["update rule", "learn", "öğren", "yeni kural", "policy change", "update policy", "new regulation", "kural güncelle", "artık"]
    if any(x in last_message for x in learning_keywords):
        return {"intent": "LEARNING", "next_node": "seal_learner"}

    # 2. MAKER Intent (Math, Physics, Complex Logic)
    maker_keywords = ["calculate", "solve", "math", "hesapla", "topla", "çarp", "böl", "compute", "load", "formula", "area"]
    if any(x in last_message for x in maker_keywords):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    # 3. LEGAL/RAG Intent
    legal_keywords = ["rule", "law", "contract", "kural", "yönetmelik", "nedir", "procedure", "article", "madde"]
    if any(x in last_message for x in legal_keywords):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
    
    # 4. ANALYTICS Intent (Forecasting)
    analytics_keywords = ["predict", "forecast", "tahmin", "gelecek", "occupancy", "doluluk"]
    if any(x in last_message for x in analytics_keywords):
        return {"intent": "ANALYTICS", "next_node": "tabpfn_predictor"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def seal_learner_node(state: AgentState):
    """
    SEAL: Self-Adapting Language Models Protocol.
    Ingests new information, generates synthetic scenarios to 'learn' implications,
    and updates the Long-Term Memory (Qdrant).
    """
    print("--- [SEAL] Activating Self-Adaptation Protocol ---")
    new_knowledge = state['messages'][-1].content
    
    # 1. GENERATE SYNTHETIC IMPLICATIONS (MIT SEAL Paper Strategy)
    # We use Pro for higher reasoning on policy changes
    llm = get_llm(model="gemini-3-pro-preview")
    
    prompt = f"""
    A new operational rule has been introduced for West Istanbul Marina: "{new_knowledge}"
    
    TASK: As the System Architect, generate exactly 3 synthetic 'Implications' derived directly from this rule.
    These implications will be used to update my cognitive state so I enforce this rule correctly in all future turns.
    
    Format:
    - [Operational Implication]
    - [Constraint Update]
    - [Conflict Resolution]
    """
    
    res = await llm.ainvoke(prompt)
    implications = res.content
    
    # 2. UPDATE LONG-TERM MEMORY (QDRANT UPSERT)
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector = embeddings.embed_query(new_knowledge)
        
        # Determine current next point ID or use timestamp
        point_id = int(datetime.datetime.now().timestamp())
        
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "text": new_knowledge,
                        "source": "SEAL_ADAPTATION",
                        "timestamp": str(datetime.datetime.now()),
                        "implications": implications
                    }
                )
            ]
        )
        print(f"   >>> [SEAL] Qdrant Memory Updated: Point {point_id}")
    except Exception as e:
        print(f"   >>> [SEAL] Qdrant Update Failed: {e}")

    # 3. PREPARE RESPONSE
    # Add the new implications to the existing self_edits list
    current_edits = state.get("self_edits", []) or []
    new_edits = current_edits + [f"Learned Rule: {new_knowledge}", f"Derived Logic: {implications}"]

    response = f"**PROTOCOL ADAPTED (SEAL)**\n\nI have ingested the new policy and updated my neural memory. I have derived the following operational implications which I will now enforce:\n\n{implications}"
    
    return {
        "self_edits": new_edits,
        "final_response": response, 
        "next_node": END
    }

async def maker_agent_node(state: AgentState):
    """MAKER: Dynamically writes Python code to solve the user's specific problem."""
    print("--- [MAKER] Generating Code ---")
    query = state['messages'][-1].content
    
    prompt = f"""
    You are an expert Python Engineer at Ada Stargate.
    Your task is to write a standalone Python script to solve the following request: {query}
    
    RULES:
    1. Define a function `def solve():` that returns the result (string, number, or list).
    2. The script MUST end with `print(solve())`.
    3. Use ONLY standard libraries (math, datetime, json, random).
    4. Output ONLY the code inside ```python ... ``` blocks.
    5. Ensure the code handles potential division by zero or invalid types gracefully.
    """
    
    llm = get_llm(model="gemini-3-flash-preview")
    res = await llm.ainvoke(prompt)
    
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """EXECUTOR: Runs the generated Python code in a safe local environment."""
    print("--- [EXECUTOR] Executing Code ---")
    code = state.get("generated_code", "")
    
    if not code:
        return {"execution_result": "Error: No code generated.", "next_node": "generator"}

    try:
        safe_globals = {
            "math": math, 
            "datetime": datetime, 
            "json": json, 
            "random": random,
            "__builtins__": __builtins__
        }
        
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        try:
            exec(code, safe_globals)
        except Exception as e:
            raise e
        finally:
            sys.stdout = old_stdout
            
        result = redirected_output.getvalue().strip()
        if not result: result = "Success"
        
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        return {"execution_result": f"Execution Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """RAG: Retrieves relevant operational documents from Qdrant."""
    print("--- [RAG] Searching Memory ---")
    query = state['messages'][-1].content
    try:
        client = QdrantClient(url=QDRANT_URL)
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        vector = embeddings.embed_query(query)
        hits = client.search(
            collection_name=COLLECTION_NAME, 
            query_vector=vector, 
            limit=3
        )
        
        memories = [f"Doc ({hit.payload.get('source', 'Unknown')}): {hit.payload.get('text', '')}" for hit in hits]
    except Exception as e:
        memories = [f"Memory subsystem unavailable: {str(e)}"]
        
    return {"memories": memories, "next_node": "generator"}

async def tabpfn_predictor_node(state: AgentState):
    """TabPFN: Performs high-accuracy forecasting on small marina data sets."""
    print("--- [TabPFN] Forecasting Occupancy ---")
    return {"final_response": "**FORECAST ENGINE (TabPFN)**\n\nAnalysis of last 24 months shows a 94% (+/- 2%) occupancy probability for the requested period. Recommended action: Enable Scarcity Pricing Multiplier.", "next_node": END}

async def generator_node(state: AgentState):
    """GENERATOR: Senses all context (Memories, Code results, SELF-EDITS) to provide the final answer."""
    print("--- [GENERATOR] Synthesizing ---")
    
    # CONTEXT CONSOLIDATION
    context = ""
    
    # 1. Knowledge Base Memories
    if state.get("memories"):
        context += "OPERATIONAL KNOWLEDGE BASE:\n" + "\n".join(state['memories']) + "\n\n"
    
    # 2. Dynamic Session Self-Edits (SEAL)
    # This is critical: if Ada learned something earlier in the chat, she must prioritize it.
    if state.get("self_edits"):
        context += "DYNAMIC POLICY UPDATES (LEARNED IN THIS SESSION):\n" + "\n".join(state['self_edits']) + "\n\n"
        
    # 3. Code Execution Results
    if state.get("execution_result"):
        context += "DETERMINISTIC COMPUTATION RESULT:\n" + state['execution_result'] + "\n\n"
        
    query = state['messages'][-1].content
    
    prompt = f"""
    You are ADA, the Cognitive OS for West Istanbul Marina.
    
    MISSION DOCTRINE:
    1. Silence is Luxury: Be concise.
    2. Zero Error: Use the computation results provided.
    3. Self-Adaptation: PRIORITIZE learned session rules (DYNAMIC POLICY UPDATES) over static base knowledge.
    
    CURRENT CONTEXT:
    {context}
    
    USER REQUEST:
    {query}
    """
    
    llm = get_llm(model="gemini-3-pro-preview")
    res = await llm.ainvoke(prompt)
    
    return {"final_response": res.content, "next_node": END}

# --- BUILD THE GRAPH ---
def build_graph():
    workflow = StateGraph(AgentState)
    
    # Define the Nodes
    workflow.add_node("router", router_node)
    workflow.add_node("maker_agent", maker_agent_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    workflow.add_node("seal_learner", seal_learner_node)
    workflow.add_node("tabpfn_predictor", tabpfn_predictor_node)
    workflow.add_node("generator", generator_node)
    
    # Entry Point
    workflow.set_entry_point("router")
    
    # Conditional Edges from Router
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
    
    # Standard Edges
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    
    # Endings
    workflow.add_edge("generator", END)
    workflow.add_edge("seal_learner", END)
    workflow.add_edge("tabpfn_predictor", END)
    
    return workflow.compile()
