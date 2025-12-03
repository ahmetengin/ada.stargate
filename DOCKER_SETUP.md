# 🐳 Ada Stargate: Production Deployment Kit (Hyperscale Edition)

This guide details how to deploy the fully operational **Ada Stargate** ecosystem using Docker. This setup integrates the **React Frontend** ("Mission Control") with the **Python Backend** ("The Brain"), **FastRTC** (Voice), and **Qdrant** (Memory).

---

## 1. System Architecture

| Service | Container Name | Port (Host) | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `ada_frontend_hyperscale` | `80` (HTTP) | React App served via Nginx. The user interface. |
| **Backend** | `ada_core_hyperscale` | `8000` | FastAPI Router + LangGraph + WebSocket Telemetry. |
| **Radio** | `ada_core_hyperscale` | `8000/radio` | FastRTC Voice Interface (Gradio mount). |
| **Memory** | `ada_qdrant` | `6333` | Vector Database for RAG (Rules & Regulations). |
| **Event Bus** | `ada_redis` | `6379` | Message broker for agent observability. |
| **Database** | `ada_postgres` | `5432` | Relational database for ledgers and user profiles. |

---

## 2. Prerequisites

1.  **Docker Desktop:** Ensure it is installed and running.
2.  **Google Gemini API Key:** Required for the LLM agents.

---

## 3. Installation & Setup

### Step 1: Directory Structure
Ensure your project root has the following structure. If you are missing the `backend` folder, the system will not build.

```text
/ (root)
├── backend/
│   ├── agents/
│   ├── architecture_graph.py  # The LangGraph Brain
│   ├── ingest.py              # Memory Loader
│   ├── main.py                # API Gateway
│   ├── nano.py                # Fast Logic
│   ├── vhf_radio.py           # Voice Logic
│   ├── requirements.txt       # Python Deps
│   └── Dockerfile             # Backend Image Config
├── nginx/
│   └── nginx.conf             # Proxy Config
├── docs/                      # Knowledge Base (MD files)
├── docker-compose.hyperscale.yml
└── .env
```

### Step 2: Configure Environment
Create a `.env` file in the root directory:

```bash
# .env
API_KEY=AIzaSyYourActualKeyHere
# Optional: Set to 'true' to enable debug logging
ADA_DEBUG=true
```

### Step 3: Build and Launch
Use the specific hyperscale compose file to start the stack.

```bash
# Build images and start containers in background
docker-compose -f docker-compose.hyperscale.yml up --build -d
```

*Note: The first build may take a few minutes as it downloads the Python machine learning libraries.*

---

## 4. Initialization (The "Learning" Phase)

When the system first starts, Ada's memory (Qdrant) is empty. You must trigger the ingestion script to read the `docs/` folder (COLREGs, Marina Rules) and create the vector embeddings.

Run this command **once** after the containers are up:

```bash
docker exec -it ada_core_hyperscale python ingest.py
```

**Expected Output:**
```text
🚀 Ingesting Knowledge Base...
📂 Scanning Directory: ../docs
...
✅ 45 memories implanted into Qdrant.
```

---

## 5. Verification

1.  **Mission Control (Frontend):**
    Open `http://localhost` in your browser. You should see the React dashboard.

2.  **API Health Check:**
    Open `http://localhost:8000/health`.
    Response: `{"status": "COGNITIVE_SYSTEM_ONLINE", ...}`

3.  **VHF Radio (Voice Interface):**
    Open `http://localhost:8000/radio`.
    You should see the "Ada VHF Radio (Channel 72)" interface. Click "Record" to speak.

---

## 6. Troubleshooting

**Issue: "Connection Refused" on Frontend**
*   **Cause:** The Nginx proxy cannot find the backend.
*   **Fix:** Ensure `ada_core_hyperscale` is running (`docker ps`). If it crashed, check logs: `docker logs ada_core_hyperscale`.

**Issue: Audio not working in Radio**
*   **Cause:** Browser permission or Microphone access.
*   **Fix:** Ensure you allowed Microphone access. Note that some browsers block WebRTC on non-HTTPS (localhost is usually fine).

**Issue: "Rate Limit Exceeded"**
*   **Cause:** Gemini API quota.
*   **Fix:** Check your Google AI Studio usage.

---

## 7. Advanced: Monitoring

To watch the "Thoughts" of the agents in real-time (The Matrix View):

```bash
# Stream logs from the backend
docker logs -f ada_core_hyperscale
```

You will see logs like:
`--- [ROUTER] Analyzing: "Calculate the mooring fee" ---`
`--- [MAKER] Writing Python Code ---`
`--- [EXECUTOR] Result: 1500.0 ---`
