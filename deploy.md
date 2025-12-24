# 🚀 Ada Stargate Production Deployment

This guide details how to deploy the **Ada Stargate** ecosystem in a production-ready containerized environment using the "Big 3" architecture.

## 🏗 Architecture Overview

The system consists of three main services orchestrated via Docker Compose:

1.  **`ada-frontend`**:
    *   **Tech**: React 18 + TypeScript + Vite.
    *   **Server**: Nginx (serving static assets & reverse proxying API calls).
    *   **Port**: 80 (HTTP) or 3000 (configurable).

2.  **`ada-backend`**:
    *   **Tech**: Python FastAPI.
    *   **Role**: Orchestrator (LangGraph), Expert Nodes (MAKER/SEAL), and API Gateway.
    *   **Port**: 8000 (Internal).

3.  **`ada-redis`**, **`ada-qdrant`**, **`ada-postgres`**:
    *   **Role**: The Nervous System (Event Bus), Memory (Vector DB), and Truth (Relational DB).

---

## 📋 Prerequisites

*   **Docker Engine** (v20.10+)
*   **Docker Compose** (v2.0+)
*   **Google Gemini API Key**

---

## ⚙️ Configuration

1.  **Environment Variables**:
    Create a `.env` file in the root directory if it doesn't exist.

    ```bash
    # .env
    API_KEY=AIzaSyYourActualKeyHere
    # Optional: Set to 'true' to enable debug logging
    ADA_DEBUG=true
    ```

    *Note: This key is injected into the containers at build time and runtime.*

---

## 🚀 Deployment Steps

### 1. Build and Start Services

Run the following command in the project root:

```bash
docker-compose -f docker-compose.hyperscale.yml up --build -d
```

*   `--build`: Forces a rebuild of the Docker images (ensures latest code & env vars are used).
*   `-d`: Runs containers in detached mode (background).

### 2. Verify Status

Check if all containers are healthy:

```bash
docker-compose -f docker-compose.hyperscale.yml ps
```

You should see:
*   `ada_frontend_hyperscale` (Up)
*   `ada_core_hyperscale` (Up)
*   `ada_redis` (Up)
*   `ada_qdrant` (Up)

### 3. Initialize Memory (First Run Only)

To make Ada "intelligent", you must ingest the documentation into the Vector Database.

```bash
docker exec -it ada_core_hyperscale python ingest.py
```

### 4. Access the Application

*   **Main Interface**: [http://localhost:3000](http://localhost:3000) (or port 80 depending on configuration).
*   **Backend API Docs (ReDoc)**: [http://localhost:3000/api/redoc](http://localhost:3000/api/redoc).
*   **Backend Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 🛠 Troubleshooting

**Issue: "API Key Missing"**
*   Ensure `.env` exists in the root.
*   Rebuild containers: `docker-compose -f docker-compose.hyperscale.yml up --build -d`.

**Issue: Frontend cannot connect to Backend**
*   The Frontend uses `/api/...` relative paths.
*   Nginx is configured to proxy `/api/` to `http://ada-core:8000`.
*   Check Nginx logs: `docker logs ada_frontend_hyperscale`.

**Issue: "Port 80/3000 is already allocated"**
*   Stop other web servers or modify `docker-compose.hyperscale.yml` to map to a different port.

---

## 🛑 Operations

**Stop Services:**
```bash
docker-compose -f docker-compose.hyperscale.yml down
```

**View Logs:**
```bash
docker-compose -f docker-compose.hyperscale.yml logs -f
```

**Restart Specific Service:**
```bash
docker-compose -f docker-compose.hyperscale.yml restart ada-core
```