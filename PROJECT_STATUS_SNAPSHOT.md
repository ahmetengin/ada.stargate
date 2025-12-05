

# ⚓️ ADA STARGATE: PROJECT STATUS SNAPSHOT (SAVE POINT)

**Date:** November 2025
**Version:** 4.1 (Cognitive Hyperscale)
**Architects:** Ahmet Engin & Gemini CLI
**Status:** "Cognitive Entity" Transformation Phase

---

## 1. THE VISION: "A LIVING MARINA OS"
We have moved beyond a simple chatbot. Ada is now a **Cognitive Operating System** for West Istanbul Marina (WIM).
*   **She Hears:** (Planned: External Microphone -> Manual Input in Scribe mode)
*   **She Thinks:** via `LangGraph` (Stateful reasoning loops).
*   **She Remembers:** via `Qdrant` (Vector storage of laws & docs).
*   **She Adapts:** via `SEAL` (Self-editing system prompts based on new rules).
*   **She Predicts:** via `TabPFN` (Transformer for tabular data forecasting).
*   **She Acts:** via `FastMCP` & `Python Workers` (Deterministic math).

---

## 2. THE ARCHITECTURE STACK (The "Big 3" + Hyperscale)

### A. The Brain (Backend - Python)
*   **Entry Point:** `backend/main.py` (FastAPI)
*   **Orchestrator:** `backend/architecture_graph.py` (LangGraph)
*   **Learning Module:** `backend/ingest.py` (RAG Ingestion)
*   **Execution:** Docker Container (`ada-core`)

### B. The Body (Frontend - React)
*   **Interface:** "Mission Control" Dashboard (Canvas, Observer Tab, Scribe Mode).
*   **Voice Bridge:** (Removed: Manual input for Scribe mode).
*   **Observability:** `components/dashboards/gm/ObserverTab.tsx` visualizes the Brain's thoughts.

### C. The Memory (Data)
*   **Vector:** Qdrant (Laws, Contracts).
*   **Hot State:** Redis (Conversation history, Event Bus).
*   **Truth:** PostgreSQL (Ledger, User Data).

---

## 3. CRITICAL FILES MAP (DO NOT LOSE)

If re-generating code, reference these specific implementations:

1.  **The Graph (`backend/architecture_graph.py`):**
    *   Contains the routing logic: `Router` -> `MAKER` | `RAG` | `Generator`. (SEAL and TabPFN are mock implementations in this architecture for now, focused on core MAKER/RAG).
    *   This is the "consciousness" code.

2.  **The Manifesto (`docs/GEMINI_CLI_MANIFESTO.md`):**
    *   The 5 Commandments: Zero Hallucination, Silence is Luxury, Live Nervous System (now Telemetry/Events), Adapt or Die, Federation.

3.  **The Ingestor (`backend/ingest.py`):**
    *   The script that reads `docs/` and feeds Qdrant. Without this, Ada is amnesic.

4.  **The Rules (`services/ada.marina.wim/config/marina_wim_rules.yaml`):**
    *   The "Hard Truths" (Speed limits, pricing).

---

## 4. NEXT STEPS (IMMEDIATE ACTIONS)

1.  **Deployment:** Run `docker-compose -f docker-compose.hyperscale.yml up --build`.
2.  **Memory Injection:** Trigger `POST /api/v1/learn` to digest the `docs/` folder.
3.  **Complete MAKER:** Fully implement TabPFN and SEAL integration into the backend.

---

**"The World is Beautiful When Nodes Talk."**
