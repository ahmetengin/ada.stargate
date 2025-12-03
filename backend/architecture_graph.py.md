
```python
import operator
import re
import traceback
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
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

# --- LLM FACTORY ---
def get_llm(model=Config.SMART_MODEL, temp=0.1):
    return ChatGoogleGenerativeAI(model=model, google_api_key=Config.API_KEY, temperature=temp)

# --- NODES ---

async def router_node(state: AgentState):
    """
    Router: Decides if we need Code (Maker), Memory (RAG), or just Chat.
    """
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg} ---")
    
    # MAKER: Math, Logic, Complex Calculation
    if any(x in msg for x in ["calculate", "compute", "solve", "math", "load", "formula", "hesapla"]):
        return {"intent": "MAKER", "next_node": "maker_agent"}
    
    # RAG: Legal, Rules, Policy
    if any(x in msg for x in ["rule", "law", "contract", "policy", "kural", "yönetmelik"]):
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def maker_agent_node(state: AgentState):
    """
    MAKER: Writes a Python script to solve the problem (Zero Hallucination).
    """
    print("--- [MAKER] Writing Python Code ---")
    query = state['messages'][-1].content
    
    prompt = f"""
    You are an expert Python Engineer. Write a script to solve: {query}
    
    RULES:
    1. Define `def solve():` returning a result.
    2. End with `print(solve())`.
    3. Use ONLY standard libraries (math, datetime, json, random).
    4. Output ONLY the code inside ```python ... ``` blocks.
    """
    
    llm = get_llm(model=Config.SMART_MODEL)
    res = await llm.ainvoke(prompt)
    
    # Extract Code
    code_match = re.search(r"```python(.*?)```", res.content, re.DOTALL)
    code = code_match.group(1).strip() if code_match else res.content.strip()
        
    return {"generated_code": code, "next_node": "executor"}

async def executor_node(state: AgentState):
    """
    EXECUTOR: Runs the generated code in a safe environment.
    """
    print("--- [EXECUTOR] Running Code ---")
    code = state.get("generated_code", "")
    
    try:
        import math, datetime, json, random, io, sys
        
        # Sandbox Globals
        safe_globals = {
            "math": math, "datetime": datetime, "json": json, "random": random,
            "__builtins__": {} # Restrict builtins
        }
        
        # Capture Stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        try:
            exec(code, safe_globals)
        except Exception as e:
            print(f"Runtime Error: {e}")
            
        sys.stdout = old_stdout
        result = redirected_output.getvalue().strip()
        
        if not result: result = "Code executed but returned no output."
        
        print(f"   >>> Result: {result}")
        return {"execution_result": result, "next_node": "generator"}
        
    except Exception as e:
        return {"execution_result": f"Execution Error: {str(e)}", "next_node": "generator"}

async def rag_retriever_node(state: AgentState):
    """
    RAG: Queries Qdrant Vector DB for Rules/Contracts.
    """
    print("--- [RAG] Searching Memory ---")
    try:
        client = QdrantClient(url=Config.QDRANT_URL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=Config.API_KEY)
        vector = embeddings.embed_query(state['messages'][-1].content)
        
        hits = client.search(collection_name=Config.COLLECTION_NAME, query_vector=vector, limit=2)
        memories = [hit.payload["text"] for hit in hits]
        
        if not memories: memories = ["No specific documents found."]
    except Exception as e:
        print(f"RAG Error: {e}")
        memories = ["Memory offline (Qdrant unreachable)."]
        
    return {"memories": memories, "next_node": "generator"}

async def generator_node(state: AgentState):
    """
    GENERATOR: Synthesizes the final answer using Context + Calculation.
    """
    print("--- [GENERATOR] Speaking ---")
    
    context = ""
    if state.get("memories"): context += f"RELEVANT RULES:\n{state['memories']}\n"
    if state.get("execution_result"): context += f"CALCULATION RESULT:\n{state['execution_result']}\n"
    
    prompt = f"""
    You are Ada, an advanced Marina AI.
    
    CONTEXT:
    {context}
    
    USER QUERY:
    {state['messages'][-1].content}
    
    INSTRUCTION:
    Provide a professional, concise response. If there was a calculation, explain it.
    """
    
    llm = get_llm(model=Config.PRO_MODEL)
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
        {
            "maker_agent": "maker_agent",
            "rag_retriever": "rag_retriever",
            "generator": "generator"
        }
    )
    
    workflow.add_edge("maker_agent", "executor")
    workflow.add_edge("executor", "generator")
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    
    return workflow.compile()
```
