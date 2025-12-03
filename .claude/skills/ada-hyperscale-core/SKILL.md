
# 🧠 Ada Hyperscale Core Skill

**Identity:** `ada-hyperscale-core`
**Backend:** Python FastAPI (`backend/main.py`)
**Architecture:** Big 3 (Router -> Expert -> Worker)

## 1. Capability Overview
This skill grants access to the "Cognitive Entity" features of Ada Stargate. It bypasses simple heuristic logic and uses the **LangGraph** state machine running in the Docker container.

## 2. When to Use
Use `query_cognitive_brain` for:
*   **Complex Reasoning:** "Why is the bill so high?" (Requires RAG + Calculation).
*   **Mathematical Precision:** "Calculate 150m2 * 1.5 EUR * 30 days." (Routes to MAKER/Python).
*   **Rule Updates:** "The speed limit is now 5 knots." (Routes to SEAL/Learner).
*   **Predictions:** "Will we be full next week?" (Routes to TabPFN).

**DO NOT** use this for simple UI updates or static data retrieval.

## 3. Tool Details

### `query_cognitive_brain(prompt, context)`
*   **Endpoint:** `POST http://ada-core:8000/api/v1/chat`
*   **Behavior:**
    1.  Send Prompt to Backend.
    2.  LangGraph Router analyzes intent.
    3.  If Math -> Executes Python Code.
    4.  If Legal -> Queries Qdrant.
    5.  Returns final answer + Execution Trace.

### `trigger_memory_ingestion()`
*   **Endpoint:** `POST http://ada-core:8000/api/v1/learn`
*   **Behavior:** Runs `backend/ingest.py`. Parses `docs/` folder (Markdown/PDF) and updates Vector Memory.

## 4. Operational Context
This skill assumes the **Docker Infrastructure** is running:
*   `ada_core_hyperscale` (Port 8000)
*   `ada_qdrant` (Port 6333)
*   `ada_redis` (Port 6379)

If the tools fail with `Connection Refused`, ensure the container stack is up via `docker-compose ps`.
