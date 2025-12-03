
```python
import uvicorn
import gradio as gr
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage

# Relative imports for compatibility
try:
    from backend.architecture_graph import build_graph
    from backend.vhf_radio import stream as radio_stream
    from backend.schemas import ChatRequest
except ImportError:
    from architecture_graph import build_graph
    from vhf_radio import stream as radio_stream
    from schemas import ChatRequest

app = FastAPI(title="Ada Stargate Hyperscale API", version="4.6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Brain
brain_graph = build_graph()

@app.get("/health")
def health():
    return {"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "FastRTC", "MAKER"]}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main Thinking Endpoint.
    """
    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
            "intent": "UNKNOWN",
            "next_node": "router",
            "generated_code": "",
            "execution_result": "",
            "memories": [],
            "final_response": ""
        }
        
        # Execute Graph
        final_state = await brain_graph.ainvoke(inputs)
        
        return {
            "text": final_state.get("final_response", "Error processing request."),
            "traces": [
                {"step": "INTENT", "node": "router", "content": final_state.get('intent', 'UNKNOWN')},
                {"step": "RESULT", "node": "generator", "content": "Response delivered."}
            ]
        }
        
    except Exception as e:
        print(f"Graph Error: {e}")
        return {"text": f"System Error: {str(e)}"}

# Mount FastRTC
# This is crucial: Mounts the radio UI at /radio
app = gr.mount_gradio_app(app, radio_stream.ui, path="/radio")

if __name__ == "__main__":
    print("🚀 Ada Stargate Backend Launching...")
    # Port 8000 exposed in Docker
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
