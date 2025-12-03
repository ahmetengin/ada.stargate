
# ⚓️ ADA - MARITIME INTELLIGENCE

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-OPERATIONAL-success?style=for-the-badge&logo=radar)
![Architecture](https://img.shields.io/badge/ARCH-HYPERSCALE_v4.1-purple?style=for-the-badge&logo=google-gemini)

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

Ada is a **Cognitive Operating System** for the maritime industry. It orchestrates a federation of autonomous nodes (Marinas, Vessels, Services) using a **"Big 4" Agent Architecture**:

1.  **Ada.Marina:** Physical Operations, IoT, Traffic Control.
2.  **Ada.Finance:** Invoicing, Payments, Yield Management.
3.  **Ada.Legal:** Compliance, Security, Contracts (RAG).
4.  **Ada.Stargate:** System Orchestration, Voice (FastRTC), Federation.

## 🚀 Quick Start

### 1. Install & Clean
```bash
npm install
chmod +x CLEANUP.sh && ./CLEANUP.sh  # Removes legacy v3 code
```

### 2. Run Frontend (Mission Control)
```bash
npm run dev
```

### 3. Run Backend (The Brain)
```bash
docker-compose -f docker-compose.hyperscale.yml up --build
```

## 📂 Project Structure

*   **`/backend`**: Python FastAPI + LangGraph (The Brain).
*   **`/services`**: TypeScript Frontend Logic & API Connectors.
*   **`/components`**: React UI (Mission Control Dashboard).
*   **`/docs`**: RAG Knowledge Base (Laws, Rules).

---
<div align="center">
  <sub>Designed & Engineered by <b>Ahmet Engin</b></sub>
</div>
