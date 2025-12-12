
# 🧬 Ada Stargate: Hyperscale Architecture Spec

**Target:** Enterprise Maritime Operations
**Core Philosophy:** "Zero Error" Calculation + "Fluid" Reasoning.

## 1. The Stack Selection Rationale

### A. Compute & Routing
*   **FastAPI:** Chosen for native AsyncIO support (handling 1000s of concurrent connections) and seamless integration with Pydantic.
*   **LangGraph:** Unlike linear chains, marina operations are cyclic (Check Weather -> If Bad -> Check Sensor -> If OK -> Depart). LangGraph models this state machine perfectly.

### B. Advanced AI Components
*   **TabPFN v2:** A transformer pre-trained on tabular data. It allows `ada.analytics` to make predictions on small marina datasets (e.g., "Will we be full next weekend?") without weeks of training.
*   **SEAL (Self-Adapting LLMs):** Marinas change rules often. SEAL allows the system to ingest a new regulation and *rewrite its own system prompts* to align with the new rule, effectively "learning" without code changes.
*   **MAKER (LATM):** LLMs are bad at math. The MAKER node writes Python code to solve calculations, ensuring zero hallucination for financial and engineering tasks.

### C. Memory Fabric
*   **Qdrant:** The "Soft Truth". Storing millions of vector embeddings for RAG. Chosen for its Rust-based performance and filtering capabilities (Hybrid Search).
*   **Redis:** The "Now". Short-term conversation state and event bus.
*   **PostgreSQL:** The "Hard Truth". Relational data for invoicing and user management.

## 2. Data Flow

1.  **Ingest:** User Prompt -> `FastAPI` -> `LangGraph`.
2.  **Route:** `Router Node` classifies intent (e.g., "Prediction" vs "Action" vs "Math").
3.  **Process:**
    *   If Prediction -> `TabPFN Node`.
    *   If Rule Change -> `SEAL Node`.
    *   If Calculation -> `MAKER Node` -> `Executor Node`.
    *   If Legal -> `RAG Node`.
4.  **Respond:** Final answer synthesized by `Generator Node` and sent back to React Frontend.
