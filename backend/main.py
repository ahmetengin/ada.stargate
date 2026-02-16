import os
import uvicorn
import subprocess
import asyncio
import json
import random
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from langchain_core.messages import HumanMessage

# Graceful Import of the Graph
# If dependencies are missing, we don't crash the server, we just disable the brain.
try:
    from architecture_graph import build_graph
    brain_available = True
except ImportError as e:
    print(f"⚠️ Warning: Could not load LangGraph: {e}")
    brain_available = False
    build_graph = None

app = FastAPI(title="Ada Stargate Hyperscale API", version="5.6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL ERROR HANDLER ---
# Prevents Nginx 500 errors by always returning valid JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"🔥 INTERNAL SERVER ERROR: {str(exc)}")
    return JSONResponse(
        status_code=200, # Return 200 so frontend parses the error JSON
        content={
            "text": f"**BACKEND CRASH**\n\nInternal Module Error: {str(exc)}", 
            "error": str(exc),
            "traces": [{"node": "ada.core", "step": "ERROR", "content": str(exc)}]
        },
    )

# Initialize Brain
brain_graph = build_graph() if (brain_available and build_graph) else None

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- TELEMETRY SIMULATION ---
async def simulate_telemetry_stream():
    while True:
        try:
            data = {
                "ts": "LIVE",
                "type": "VESSEL_TELEMETRY",
                "severity": "info",
                "source": "ada.marina.wim",
                "marina_id": "WIM",
                "payload": {
                    "battery": { "serviceBank": round(24.0 + random.uniform(0, 1.5), 1), "engineBank": 26.1, "status": "DISCHARGING" },
                    "tanks": { "fuel": 45, "freshWater": 80, "blackWater": int(15 + random.uniform(0, 1)) },
                    "shorePower": { "connected": True, "voltage": int(220 + random.uniform(-5, 5)), "amperage": 12.5 },
                    "environment": { "windSpeed": round(12 + random.uniform(-2, 5), 1), "windDir": "NW" }
                }
            }
            await manager.broadcast(json.dumps(data))
        except Exception:
            pass
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_telemetry_stream())

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class ChatRequest(BaseModel):
    prompt: str
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}
    self_edits: Optional[List[str]] = []

@app.get("/health")
def health():
    return {
        "status": "COGNITIVE_SYSTEM_ONLINE", 
        "modules": ["LangGraph", "MAKER", "RAG", "SEAL"],
        "brain_loaded": brain_graph is not None
    }

def run_ingestion_task():
    try:
        subprocess.run(["python", "ingest.py"], check=True)
    except Exception as e:
        print(f"Ingestion failed: {e}")

@app.post("/api/v1/learn")
async def trigger_learning(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_ingestion_task)
    return {"status": "Learning protocol initiated."}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    if not brain_graph:
        # Graceful fallback if graph failed to load
        return {
            "text": "**CORE OFFLINE**\n\nThe Python Brain could not initialize (likely missing API_KEY or Dependencies).", 
            "traces": [{"node": "ada.core", "step": "ERROR", "content": "Brain Graph is None"}]
        }

    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
            "intent": "UNKNOWN",
            "next_node": "router",
            "generated_code": "",
            "execution_result": "",
            "memories": [],
            "self_edits": request.self_edits,
            "final_response": ""
        }
        
        final_state = await brain_graph.ainvoke(inputs)
        
        return {
            "text": final_state.get("final_response", "System processing error."),
            "self_edits": final_state.get("self_edits", []),
            "traces": [
                {"step": "INTENT", "node": "router", "content": final_state.get('intent', 'UNKNOWN')},
                {"step": "KNOWLEDGE", "node": "rag_retriever", "content": f"Found {len(final_state.get('memories', []))} documents."},
                {"step": "LEARNING", "node": "seal_learner", "content": f"Learned {len(final_state.get('self_edits', []))} rules."}
            ]
        }
        
    except Exception as e:
        print(f"Graph Execution Error: {e}")
        # Return a valid JSON even on error so frontend doesn't hang
        return {
            "text": f"**COGNITIVE ERROR**\n\nI encountered an error while processing your request in the Python Core: {str(e)}", 
            "traces": [{"node": "ada.core", "step": "CRITICAL", "content": str(e)}]
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
