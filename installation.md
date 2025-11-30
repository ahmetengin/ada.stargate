# 🍎 Installation Guide: Mac M3 (Apple Silicon)

This guide details how to deploy **Ada Stargate** on MacBook Air/Pro with M1/M2/M3 chips using Docker Desktop.

## 📋 Prerequisites

1.  **Docker Desktop for Mac (Apple Silicon):**
    *   Download from [Docker.com](https://www.docker.com/products/docker-desktop/).
    *   Ensure "Use Rosetta for x86/amd64 emulation on Apple Silicon" is checked in Docker settings (Settings > General).
2.  **Google Gemini API Key:**
    *   Get one here: [aistudio.google.com](https://aistudio.google.com/).

---

## 🚀 Setup Instructions

### 1. Create Environment File
The application requires your API key at build time.

1.  Create a file named `.env` in the root directory.
2.  Add your key:
    ```properties
    API_KEY=AIzaSyYourKeyHere...
    ```

### 2. Configure Ports (Critical for Mac)
MacOS often uses port `80` (System services) and `5000` (AirPlay Receiver), which can conflict with Docker.

**Action:** Open `docker-compose.yml` and map the frontend to port `3000` instead of `80`.

```yaml
  ada-frontend:
    # ...
    ports:
      - "3000:80"  # CHANGE THIS: Map host port 3000 to container port 80
    # ...
```

### 3. Build and Run
Open your terminal in the project folder and run:

```bash
docker-compose up --build
```

*Note: The first build may take 2-5 minutes as it downloads Python and Node.js images optimized for ARM64.*

### 4. Access the Application

Once the logs show `Uvicorn running...` and `Nginx...`:

*   **Frontend (Mission Control):** [http://localhost:3000](http://localhost:3000)
*   **Backend Docs (ReDoc):** [http://localhost:3000/api/redoc](http://localhost:3000/api/redoc)

---

## 🛠️ Troubleshooting M3 Issues

**Issue: `exec format error`**
*   **Cause:** Trying to run an Intel (AMD64) image on M3 without emulation.
*   **Fix:** Ensure Rosetta is enabled in Docker Desktop settings. Alternatively, add `platform: linux/amd64` to the service in `docker-compose.yml` (slower).

**Issue: `Bind for 0.0.0.0:80 failed: port is already allocated`**
*   **Cause:** MacOS system processes are using port 80.
*   **Fix:** Ensure you completed **Step 2** above and accessed the app at port `3000`.

**Issue: Frontend cannot connect to Backend**
*   **Fix:** The architecture uses Nginx reverse proxying. Ensure you are accessing the app via `localhost:3000` (Frontend) so Nginx can correctly route `/api` requests to the internal backend container. Do not try to hit the backend directly unless you mapped port 8000.
