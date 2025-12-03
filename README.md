
# ⚓️ ADA - MARITIME INTELLIGENCE

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-OPERATIONAL-success?style=for-the-badge&logo=radar)
![Architecture](https://img.shields.io/badge/ARCH-HYPERSCALE_v4.6-purple?style=for-the-badge&logo=google-gemini)

```text
    _    ____      _    
   / \  |  _ \    / \   
  / _ \ | | | |  / _ \  
 / ___ \| |_| | / ___ \ 
/_/   \_\____/ /_/   \_\
                        
[ ORCHESTRATING THE SILENCE OF THE SEA ]
```

</div>

## 🌊 Overview

Ada is a **Cognitive Operating System** for the maritime industry. It orchestrates a federation of autonomous nodes (Marinas, Vessels, Services) using a **"Big 3" Agent Architecture**:

1.  **Ada.Marina:** Physical Operations, IoT, Traffic Control.
2.  **Ada.Finance:** Invoicing, Payments, Yield Management.
3.  **Ada.Legal:** Compliance, Security, Contracts (RAG).
4.  **Ada.Stargate:** System Orchestration, Voice (FastRTC), Federation.

---

## 🛠️ Installation & Setup

### 1. Frontend (React / Mission Control)
This runs the dashboard interface.
```bash
npm install
npm run dev
```

### 2. Backend (Python / The Brain)
⚠️ **CRITICAL:** The Python Backend (FastAPI, FastRTC, LangGraph) cannot be run directly in a browser environment.

We have packaged the entire backend source code and infrastructure configuration into a **Master Deployment Kit**.

👉 **[CLICK HERE FOR BACKEND SETUP GUIDE (DOCKER_SETUP.md)](./DOCKER_SETUP.md)**

Follow the instructions in `DOCKER_SETUP.md` to:
1.  Create the `backend/` directory structure.
2.  Deploy the **FastRTC Radio** (Voice).
3.  Launch the **LangGraph Brain**.
4.  Spin up **Docker Containers** (Redis, Qdrant, Nginx).

---

## 📂 Project Structure

*   **`/backend`**: (See `DOCKER_SETUP.md`) Python FastAPI + LangGraph (The Brain).
*   **`/services`**: TypeScript Frontend Logic & API Connectors.
*   **`/components`**: React UI (Mission Control Dashboard).
*   **`/docs`**: RAG Knowledge Base (Laws, Rules).

---
<div align="center">
  <sub>Designed & Engineered by <b>Ahmet Engin</b></sub>
</div>