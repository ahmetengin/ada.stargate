
# ⚓️ ADA STARGATE: COGNITIVE MARITIME OS

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-HYPERSCALE_v4.6-purple?style=for-the-badge&logo=google-gemini)
![Architecture](https://img.shields.io/badge/ARCH-BIG_3_AGENTS-blue?style=for-the-badge&logo=python)
![Interface](https://img.shields.io/badge/UI-MISSION_CONTROL-emerald?style=for-the-badge&logo=react)

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

Ada Stargate is not a chatbot. It is a **Federated Cognitive Operating System** for marinas and autonomous vessels. 
It combines **Real-Time Voice (FastRTC)**, **Cognitive Routing (LangGraph)**, and **IoT Telemetry (MQTT)** to manage physical operations.

---

## 🏗️ Architecture (The "Big 3")

1.  **The Brain (Backend):** Python FastAPI + LangGraph. Handles complex reasoning, RAG (Qdrant), and Math (Workers).
2.  **The Body (Frontend):** React + Vite. A "Mission Control" dashboard providing real-time situational awareness.
3.  **The Senses (IoT/Voice):** FastRTC (WebRTC Audio) + MQTT (Sensor Data).

---

## 🚀 Quick Start (Docker)

This is the recommended way to run the full stack (Frontend, Backend, DBs) in production mode.

### 1. Prerequisites
*   Docker Desktop
*   Google Gemini API Key

### 2. Setup
Create a `.env` file in the root:
```properties
API_KEY=AIzaSyYourKeyHere...
```

### 3. Launch
```bash
docker-compose up --build -d
```

### 4. Initialize Memory (Learning)
When first started, Ada is amnesic. Teach her the rules:
```bash
docker exec -it ada_core_hyperscale python ingest.py
```

### 5. Access Points
*   **Mission Control:** [http://localhost](http://localhost) (Port 80 or 3000 on Mac)
*   **VHF Radio:** [http://localhost:8000/radio](http://localhost:8000/radio)
*   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

*   **`backend/`**: The Python Brain (LangGraph, FastRTC, Agents).
*   **`components/`**: React UI Components.
*   **`docs/`**: The Knowledge Base (Source of Truth for RAG).
*   **`services/`**: Frontend Logic & API Connectors.
*   **`iot/`**: Raspberry Pi / Edge Node scripts.

---
<div align="center">
  <sub>Engineered for <b>West Istanbul Marina</b> by <b>Ahmet Engin</b></sub>
</div>
