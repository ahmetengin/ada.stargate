# 🚀 Ada Stargate: Hyperscale Upgrade Guide

Since we are in a web environment and cannot execute direct shell commands, follow this manual guide to upgrade Ada to the **v4.1 Cognitive Hyperscale** architecture.

---

## 1. Prerequisites

Ensure you have the following installed on your local machine:
*   **Docker Desktop**
*   **Python 3.11+**
*   **Node.js 18+**

---

## 2. Infrastructure Setup (Docker)

We have created `docker-compose.hyperscale.yml`. You need to use this to spin up the entire stack.

### Command:
```bash
# Stop existing containers
docker-compose down

# Start the Hyperscale Stack
docker-compose -f docker-compose.hyperscale.yml up -d --build
```

**What this does:**
1.  Starts **Redis** (Event Bus).
2.  Starts **Qdrant** (Vector Memory).
3.  Starts **Postgres** (Relational Data).
4.  Builds & Starts **Ada Core** (Python Backend on port 8000).
5.  Builds & Starts **Ada Frontend** (React Interface on port 3000).
6.  Builds & Starts **SignalK Server** (Sensor Hub on port 3001).

---

## 3. Memory Ingestion (The "Learning" Phase)

The system needs to read your documentation (`docs/`) and create the Vector Memory in Qdrant.

### Command:
```bash
# Execute the ingestion script inside the running backend container
docker exec -it ada_core_hyperscale python ingest.py
```

**Expected Output:**
```text
🚀 Ingesting Knowledge Base...
✅ 45 memories implanted into Qdrant.
```

---

## 4. Verification

### A. Check Backend Health
Open your browser or use curl:
`http://localhost:8000/health`
> Response: `{"status": "COGNITIVE_SYSTEM_ONLINE", ...}`

### B. Check Main Interface
`http://localhost:3000`
> The React Dashboard should load.

### C. Check SignalK Admin
`http://localhost:3001`
> The SignalK server dashboard should load, allowing you to manage data connections.

---

## 5. Troubleshooting

*   **Error:** `invokeAgentSkill is not found`
    *   **Fix:** I have updated `services/api.ts` to include this missing function. Refresh the frontend.
*   **Error:** `Connection Refused` on port 8000
    *   **Fix:** Ensure the `ada-core` container is running via `docker ps`. If it crashed, check logs with `docker logs ada_core_hyperscale`.
*   **Error:** OpenAI/Gemini API Errors
    *   **Fix:** Ensure your `.env` file has the correct `API_KEY`.

---

**System Status:** Ready for manual activation.
