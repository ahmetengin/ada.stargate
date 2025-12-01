
# ⚓️ ADA STARGATE: HYPERSCALE MASTER CODEBASE (v4.6 - OMNI-PRESENCE)

**Architect:** Ada Core Team
**Version:** 4.6 (Omni-Presence)
**Status:** Ready for Physical Deployment

Bu dosya, Ada'yı bir "Yazılım"dan fiziksel dünyayı yöneten, canlı veri akışı sağlayan ve proaktif kararlar alan bir **Canlı İşletim Sistemi**ne dönüştüren **v4.6** yükseltmelerini içerir.

---

## 🛠️ 1. INFRASTRUCTURE (DOCKER)

### `docker-compose.hyperscale.yml`
Eklenen: **Mosquitto (MQTT Broker)**. Bu, Ada'nın fiziksel sensörlerle (Rüzgar, Elektrik, Duman) konuşmasını sağlayan sinir ucudur.

```yaml
version: '3.9'

services:
  # 1. THE BRAIN (Python LangGraph + FastRTC + IoT)
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    ports:
      - "8000:8000" # API & Websocket
      - "7860:7860" # FastRTC UI
    environment:
      - API_KEY=${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
      - MQTT_BROKER=ada-mqtt 
    depends_on:
      - ada-redis
      - ada-qdrant
      - ada-mqtt
    volumes:
      - ./backend:/app
      - ./docs:/docs

  # 2. MEMORY (Vector DB - Long Term)
  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  # 3. TRUTH (Relational DB - Entities)
  ada-postgres:
    image: postgres:15-alpine
    container_name: ada_postgres
    environment:
      POSTGRES_USER: ada
      POSTGRES_PASSWORD: adapassword
      POSTGRES_DB: wim_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 4. NERVOUS SYSTEM (Event Bus - Short Term)
  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # --- NEW: THE SENSORY SYSTEM (IoT Broker) ---
  ada-mqtt:
    image: eclipse-mosquitto:2
    container_name: ada_mqtt_broker
    ports:
      - "1883:1883" # MQTT Port
      - "9001:9001" # Websocket Port
    volumes:
      - mqtt_data:/mosquitto/data
      - mqtt_log:/mosquitto/log

  # 5. FRONTEND (React Interface)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ada_frontend_hyperscale
    ports:
      - "80:80"
    environment:
      - API_KEY=${API_KEY}
    depends_on:
      - ada-core

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
  mqtt_data:
  mqtt_log:
```

### `nginx/nginx.conf`
Updated to support FastRTC (`/radio`) and WebSocket (`/ws`) proxying.

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;

        # Serve React App
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API Requests
        location /api/ {
            proxy_pass http://ada-core:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Proxy WebSocket Telemetry
        location /ws/ {
            proxy_pass http://ada-core:8000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Proxy FastRTC / Radio Interface
        location /radio/ {
            proxy_pass http://ada-core:8000/radio/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

### `vite.config.ts`
For local development proxying.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        changeOrigin: true,
        ws: true
      },
      '/radio': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        ws: true
      }
    }
  }
});
```

---

## 🐍 2. THE BRAIN (PYTHON BACKEND)

### `backend/requirements.txt`
```text
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai>=0.3.0
httpx>=0.26.0
redis>=5.0.0
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
qdrant-client
asyncpg
markdown
beautifulsoup4
fastrtc>=0.1.0
gradio>=5.0.0
numpy
scipy
loguru
paho-mqtt>=1.6.1
schedule>=1.2.0
websockets>=12.0
```

### `backend/main.py`
WebSocket & FastRTC Enabled API.

```python
import os
import uvicorn
import threading
import asyncio
import json
import random
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import gradio as gr
from langchain_core.messages import HumanMessage

# Import Internal Modules (with Fallback)
try:
    from backend.architecture_graph import build_graph
    from backend.vhf_radio import stream as radio_stream
    from backend.iot_gateway import start_mqtt_listener
    from backend.proactive_daemon import start_daemon
except ImportError:
    from architecture_graph import build_graph
    from vhf_radio import stream as radio_stream
    from iot_gateway import start_mqtt_listener
    from proactive_daemon import start_daemon

app = FastAPI(title="Ada Stargate Hyperscale API", version="4.6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

brain_graph = build_graph()

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
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- TELEMETRY SIMULATOR ---
async def simulate_telemetry_stream():
    """Simulates live NMEA2000/SignalK data stream."""
    while True:
        data = {
            "type": "VESSEL_TELEMETRY",
            "timestamp": "LIVE",
            "payload": {
                "battery": { "serviceBank": round(24.0 + random.uniform(0, 1.5), 1), "engineBank": 26.1, "status": "DISCHARGING" },
                "tanks": { "fuel": 45, "freshWater": 80, "blackWater": int(15 + random.uniform(0, 1)) },
                "bilge": { "forward": "DRY", "aft": "DRY", "pumpStatus": "AUTO" },
                "shorePower": { "connected": True, "voltage": int(220 + random.uniform(-5, 5)), "amperage": 12.5 },
                "comfort": { "climate": { "zone": "Salon", "currentTemp": 23.5, "mode": "COOL" } },
                "environment": { "windSpeed": round(12 + random.uniform(-2, 5), 1), "windDir": "NW" }
            }
        }
        await manager.broadcast(json.dumps(data))
        await asyncio.sleep(2)

class ChatRequest(BaseModel):
    prompt: str
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}

@app.on_event("startup")
async def startup_event():
    print("🚀 Igniting Ada Stargate v4.6 Systems...")
    # 1. Daemon
    daemon_thread = threading.Thread(target=start_daemon, daemon=True)
    daemon_thread.start()
    # 2. Telemetry
    asyncio.create_task(simulate_telemetry_stream())

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
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
        final_state = await brain_graph.ainvoke(inputs)
        return {
            "text": final_state.get("final_response", "System processing error."),
            "traces": [{"step": "ROUTING", "node": "router", "content": f"Intent: {final_state.get('intent')}"}]
        }
    except Exception as e:
        print(f"Graph Error: {e}")
        return {"text": f"System Error: {str(e)}"}

# Mount FastRTC Radio at /radio
app = gr.mount_gradio_app(app, radio_stream.ui, path="/radio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 3. FRONTEND INTEGRATION

### `services/telemetryStream.ts`
Manage WebSocket connection.

```typescript
export type TelemetryCallback = (data: any) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private reconnectInterval = 5000;

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

        const protocol = window.location.protocol.includes('https') ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        try {
            this.socket = new WebSocket(wsUrl);
            this.socket.onmessage = (event) => {
                try { this.notifyListeners(JSON.parse(event.data)); } catch (e) {}
            };
            this.socket.onclose = () => setTimeout(() => this.connect(), this.reconnectInterval);
        } catch (error) {
            console.error("[Telemetry] Connection failed:", error);
        }
    }

    subscribe(callback: TelemetryCallback) {
        this.listeners.push(callback);
        this.connect();
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }

    private notifyListeners(data: any) { this.listeners.forEach(l => l(data)); }
}

export const telemetryStream = new TelemetryStreamService();
```

---

## 4. DEPLOYMENT

1.  **Files:** Copy code to `backend/main.py`, `services/telemetryStream.ts`, `vite.config.ts`, `nginx/nginx.conf`.
2.  **Launch:** `docker-compose -f docker-compose.hyperscale.yml up --build`
3.  **Access:** `http://localhost:80` (Frontend), `http://localhost:80/radio` (FastRTC via Proxy).
