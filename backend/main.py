import os
import uvicorn
import subprocess
import asyncio
import json
import random
import threading
import gradio as gr
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from langchain_core.messages import HumanMessage

# Try to import graph, handle error if not yet generated
try:
    from architecture_graph import build_graph
    from vhf_radio import stream as radio_stream
    from iot_gateway import start_mqtt_listener
except ImportError:
    build_graph = None
    radio_stream = type('obj', (object,), {'ui': None})
    start_mqtt_listener = lambda: None

app = FastAPI(title="Ada Stargate Hyperscale API", version="5.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Brain if available
brain_graph = build_graph() if build_graph else None

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # Broadcast to all connected clients (React Frontend)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- TELEMETRY SIMULATION ---
async def simulate_telemetry_stream():
    """Simulates live NMEA2000/SignalK data stream for the UI."""
    while True:
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
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    # Start MQTT Listener in background
    mqtt_thread = threading.Thread(target=start_mqtt_listener, daemon=True)
    mqtt_thread.start()
    
    # Start the telemetry background task
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
    self_edits: Optional[List[str]] = [] # Carry forward learned rules

@app.get("/health")
def health():
    return {
        "status": "COGNITIVE_SYSTEM_ONLINE", 
        "modules": ["LangGraph", "MAKER", "RAG", "SEAL", "FastRTC", "MQTT"],
        "brain_loaded": brain_graph is not None
    }

def run_ingestion_task():
    print("Triggering background memory ingestion...")
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
        return {"text": "Brain not initialized. Please check backend logs.", "traces": []}

    try:
        # Prepare Input State for LangGraph
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
        
        # Execute the Graph
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
        return {"text": f"System Error: {str(e)}", "traces": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
