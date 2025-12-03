
# 🧠 ADA STARGATE: ARCHITECTURAL CONTEXT FOR AI AGENTS

**Current Version:** 4.6 (Omni-Presence)
**Primary Doctrine:** Zero Error, Low Latency, "The World is Beautiful When Nodes Talk."

## 1. System Overview
Ada Stargate is a **Cognitive Operating System** for the maritime industry (Marinas & Vessels). It is NOT a simple chatbot. It is a federated multi-agent system composed of a React Frontend (Mission Control) and a Python Backend (The Brain).

## 2. Tech Stack (The "Big 3" Architecture)

### A. The Brain (Backend)
*   **Language:** Python 3.11+
*   **Framework:** FastAPI (Async I/O)
*   **Orchestration:** **LangGraph** (Stateful, Cyclic Reasoning).
*   **Voice:** **FastRTC** (WebRTC/Gradio) for sub-second VHF simulation.
*   **Memory:** **Qdrant** (Vector/RAG) + **Redis** (Hot State/PubSub).
*   **Execution:** **FastMCP** (Tool Server) + **Workers** (Deterministic Python Scripts).
*   **Analytics:** **TabPFN** (Transformer for Tabular Data Prediction).
*   **Adaptation:** **SEAL** (Self-Adapting LLM Protocol for Rule Ingestion).

### B. The Body (Frontend)
*   **Language:** TypeScript (React 18 + Vite).
*   **Styling:** Tailwind CSS (Dark Mode "Mission Control" Aesthetic).
*   **Communication:** 
    *   `services/api.ts` -> REST (Chat/Actions).
    *   `services/liveService.ts` -> WebRTC (Voice).
    *   `services/telemetryStream.ts` -> WebSocket (Real-time IoT data).

## 3. Agent Topology (Who does what?)

| Agent ID | Persona | Responsibility | Tools/Skills |
| :--- | :--- | :--- | :--- |
| **`ada.stargate`** | Orchestrator | Router, System Health, Federation. | `router_node`, `federation_link` |
| **`ada.marina`** | Harbour Master | Berthing, Traffic, Weather, Sensors. | `calculate_berth`, `scan_radar`, `mqtt_iot` |
| **`ada.finance`** | CFO | Invoicing, Debt, Payments, Insurance. | `create_invoice`, `check_debt`, `calc_yield` |
| **`ada.legal`** | Counsel | Contracts, Rules, KVKK, Security. | `rag_search` (Qdrant), `seal_learner` |
| **`ada.vhf`** | Radio Op | Voice Comms (Channel 72). | `fast_rtc_stream`, `nano_agent` |

## 4. Critical File Map

*   **`backend/architecture_graph.py`**: The "Consciousness". Defines the LangGraph routing logic.
*   **`backend/main.py`**: The API Gateway. Mounts FastAPI and Gradio (FastRTC).
*   **`backend/ingest.py`**: The Learning Module. Reads `docs/` and embeds into Qdrant.
*   **`backend/vhf_radio.py`**: The Voice Module. Handles Audio I/O.
*   **`components/dashboards/GMDashboard.tsx`**: The main operational view.
*   **`docker-compose.yml`**: The infrastructure definition.

## 5. Coding Standards for AI (Strict)
1.  **Zero Hallucination:** NEVER guess math. Write a Python script (Worker) to calculate values.
2.  **Episodic UI:** The Frontend adapts to context (Red Alert vs. Calm Blue).
3.  **Type Safety:** Use Pydantic models in Python and Interfaces in TypeScript.
4.  **Observability:** All agent actions must emit a trace log to Redis.

*Use this context to generate code that integrates seamlessly with existing patterns.*
