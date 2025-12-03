
# ⚓️ ADA STARGATE: COGNITIVE MARITIME OS

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-HYBRID_MODE-orange?style=for-the-badge&logo=docker)
![Architecture](https://img.shields.io/badge/BRAIN-GEMINI_%2B_GEMMA-blue?style=for-the-badge&logo=google)
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

Ada Stargate is a **Federated Cognitive Operating System** for marinas and autonomous vessels. 
It combines **Real-Time Voice (FastRTC)**, **Cognitive Routing (LangGraph)**, and **IoT Telemetry (MQTT)**.

**NEW: Hybrid Resilience Architecture**
Ada now operates in two modes automatically:
1.  **Online:** Uses Google Gemini 2.5 (Cloud) for maximum intelligence.
2.  **Offline:** Falls back to Google Gemma (Local via Ollama) for mission-critical continuity.

---

## 🏗️ Architecture (The "Big 3")

1.  **The Brain (Backend):** Python FastAPI + LangGraph. Handles Hybrid Routing (Cloud/Local).
2.  **The Body (Frontend):** React + Vite. A "Mission Control" dashboard providing real-time situational awareness.
3.  **The Senses (IoT/Voice):** FastRTC (WebRTC Audio) + MQTT (Sensor Data).

---

## 🚀 Quick Start (Docker)

This is the recommended way to run the full stack (Frontend, Backend, DBs, Local AI) in production mode.

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
docker-compose -f docker-compose.hyperscale.yml up --build -d
```

### 4. Initialize Hybrid Brain (CRITICAL STEP)
You must download the local model *once* so Ada can think offline:
```bash
# Download Google's Gemma model to the local container
docker exec -it ada_local_llm ollama pull gemma:2b
```

### 5. Initialize Memory (Learning)
Teach her the rules (Uses Local Embeddings for offline RAG):
```bash
docker exec -it ada_core_hyperscale python ingest.py
```

### 6. Access Points
*   **Mission Control:** [http://localhost](http://localhost) (Port 80 or 3000 on Mac)
*   **VHF Radio:** [http://localhost:8000/radio](http://localhost:8000/radio)
*   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

*   **`backend/`**: The Python Brain (LangGraph, FastRTC, Agents, **Hybrid Router**).
*   **`components/`**: React UI Components.
*   **`docs/`**: The Knowledge Base (Source of Truth for RAG).
*   **`services/`**: Frontend Logic & API Connectors.

---
<div align="center">
  <sub>Engineered for <b>West Istanbul Marina</b> by <b>Ahmet Engin</b></sub>
</div>
