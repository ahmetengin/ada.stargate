
# 🧬 Ada Stargate: Hyperscale Architecture Spec

**Target:** Enterprise Maritime Operations
**Core Philosophy:** "Zero Error" Calculation + "Fluid" Reasoning.

## 1. The Stack Selection Rationale

### A. Compute & Routing (The Backbone)
*   **FastAPI:** Chosen for its high-performance asynchronous capabilities. It acts as the primary gateway, handling potentially thousands of concurrent WebSocket connections for real-time telemetry (e.g., vessel sensors, weather stations). Pydantic integration ensures strict data validation at the API boundary.
*   **LangGraph:** Selected to model the non-linear, cyclic nature of marina operations. Unlike simple linear chains, marina decisions involve loops and state checks (e.g., *Check Berth -> Occupied? -> Check Next Best -> Calculate Price -> Customer Approval*). LangGraph's stateful graph architecture is perfect for this "State Machine" logic.

### B. Advanced AI Components (The Cortex)
*   **TabPFN v2:** A Transformer model pre-trained on tabular data. It allows `ada.analytics` to perform high-accuracy forecasting on small datasets without extensive training.
    *   *Use Case:* Predicting weekend occupancy based on current weather and historical booking data.
*   **SEAL (Self-Adapting LLMs):** Marinas operate in a dynamic regulatory environment. SEAL enables the system to ingest new rules (e.g., "New tax regulation: +2% on vessels > 20m") and automatically update its reasoning context without code rewrites.
    *   *Use Case:* The system automatically adjusts pricing logic after a natural language policy update from the GM.
*   **MAKER (LATM - Large Language Models as Tool Makers):** LLMs struggle with precise arithmetic. The MAKER node generates ad-hoc Python scripts to perform calculations, ensuring zero hallucinations.
    *   *Use Case:* Calculating a complex pro-rated refund for a cancelled annual contract. The LLM writes a script `calculate_refund.py`, executes it, and returns the exact figure.

### C. Memory Fabric (The Hippocampus)
*   **Qdrant:** The "Soft Truth". Stores millions of vector embeddings for RAG (Retrieval Augmented Generation). It holds the semantic knowledge of contracts, maritime laws (COLREGs), and internal procedures.
*   **Redis:** The "Now". Acts as the hot storage for active conversation state and the high-speed Event Bus (Pub/Sub) for inter-agent communication.
*   **PostgreSQL:** The "Hard Truth". Stores structured, relational data that demands ACID compliance: Invoices, Customer Profiles, Asset Registries.

## 2. Data Flow (Veri Akışı)

1.  **Ingest:** User Message -> `FastAPI` -> `LangGraph Orchestrator`.
2.  **Route:** The `Router Node` classifies the intent using semantic understanding.
    *   *Is it a prediction request?*
    *   *Is it a calculation?*
    *   *Is it a policy update?*
3.  **Process:**
    *   **Prediction:** Route to `TabPFN Node`. (Input: Historical CSV + Current State -> Output: Probability Distribution).
    *   **Rule Update:** Route to `SEAL Node`. (Input: New Rule Text -> Output: Synthetic Context Update).
    *   **Calculation:** Route to `MAKER Node`. (Input: Problem Description -> Output: Python Script -> `Executor Node` -> Result).
    *   **Knowledge/Legal:** Route to `RAG Node`. (Input: Query -> Output: Relevant Document Chunks).
4.  **Respond:** The `Generator Node` synthesizes the outputs from the specialized nodes into a coherent, natural language response for the user.

---

## 3. Why "Big 3"? (Neden Bu Mimari?)

In legacy "Single Agent" systems, one massive LLM attempts to handle routing, logic, math, and creative writing simultaneously. This often leads to "hallucinations" (math errors) or context overflow.

The **Big 3 (Router -> Expert -> Worker)** architecture solves this by enforcing strict separation of concerns:

1.  **Router:** The Traffic Controller. It doesn't solve problems; it just knows *who* can. It directs traffic to the right Expert.
2.  **Expert:** The Architect. It knows *how* to solve the problem but doesn't do the grunt work. It plans the steps and delegates.
3.  **Worker:** The Hands. These are deterministic code blocks (Python scripts, SQL queries) or specialized models (TabPFN) that execute specific tasks with **Zero Error**.

**Example:**
*   **User:** "Calculate the invoice for S/Y Phisedelia."
*   **Router:** Sends to `Finance Expert`.
*   **Finance Expert:** "I need to fetch the rate and days, then multiply them." (Plan). Delegates to `Worker`.
*   **Worker:** Executes `SELECT rate, days FROM db WHERE vessel='Phisedelia'` then `return rate * days`. (Math).
*   **Generator:** "The invoice total is €1,250." (Response).

This architecture is the key to achieving enterprise-grade reliability in an AI system.
