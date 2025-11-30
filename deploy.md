# 🚀 Ada Stargate Production Deployment

This guide details how to deploy the **Ada Stargate** ecosystem in a production-ready containerized environment using the "Big 3" architecture.

## 🏗 Architecture Overview

The system consists of three main services orchestrated via Docker Compose:

1.  **`ada-frontend`**:
    *   **Tech**: React 18 + TypeScript + Vite.
    *   **Server**: Nginx (serving static assets & reverse proxying API calls).
    *   **Port**: 80 (HTTP).

2.  **`ada-backend`**:
    *   **Tech**: Python FastAPI.
    *   **Role**: Orchestrator, Expert Nodes, and Workers.
    *   **Port**: 8000 (Internal).

3.  **`ada-redis`**:
    *   **Tech**: Redis.
    *   **Role**: Message Broker / Event Bus for observability.
    *   **Port**: 6379 (Internal).

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
    ```

    *Note: This key is injected into the containers at build time and runtime.*

---

## 🚀 Deployment Steps

### 1. Build and Start Services

Run the following command in the project root:

```bash
docker-compose up --build -d
```

*   `--build`: Forces a rebuild of the Docker images (ensures latest code & env vars are used).
*   `-d`: Runs containers in detached mode (background).

### 2. Verify Status

Check if all containers are healthy:

```bash
docker-compose ps
```

You should see:
*   `ada_frontend` (Up)
*   `ada_backend` (Up)
*   `ada_redis_broker` (Up)

### 3. Access the Application

*   **Main Interface**: [http://localhost](http://localhost)
*   **Backend API Docs (ReDoc)**: [http://localhost/api/redoc](http://localhost/api/redoc) (Preferred Style)
*   **Backend API Docs (Swagger)**: [http://localhost/api/docs](http://localhost/api/docs)

---

## 🛠 Troubleshooting

**Issue: "API Key Missing"**
*   Ensure `.env` exists in the root.
*   Rebuild containers: `docker-compose up --build -d`.

**Issue: Frontend cannot connect to Backend**
*   The Frontend uses `/api/...` relative paths.
*   Nginx is configured to proxy `/api/` to `http://ada-backend:8000`.
*   Check Nginx logs: `docker logs ada_frontend`.

**Issue: "Port 80 is already allocated"**
*   Stop other web servers or modify `docker-compose.yml` to map to a different port (e.g., `"8080:80"`).

---

## 🛑 Operations

**Stop Services:**
```bash
docker-compose down
```

**View Logs:**
```bash
docker-compose logs -f
```

**Restart Specific Service:**
```bash
docker-compose restart ada-backend
```