
# 📘 Ada Stargate: Hyperscale User Manual

**Version:** 4.1 (Cognitive Entity)
**Architecture:** LangGraph + FastMCP + TabPFN + SEAL

---

## 1. Introduction: The Cognitive OS

You have deployed a federation of specialized intelligence engines.
*   **LangGraph**: The Orchestrator (Decision Maker).
*   **TabPFN**: The Analyst (Predicts without training).
*   **SEAL**: The Learner (Rewrites its own prompts).
*   **Qdrant**: The Memory (Vector Search).

---

## 2. Operational Commands

### Start the System
```bash
docker-compose -f docker-compose.hyperscale.yml up -d --build
```

### Check System Health
```bash
curl http://localhost:8000/health
```
*Expected Output:* `{"status": "operational", "nodes": ["LangGraph", "TabPFN", "SEAL", "FastRTC"]}`

### Trigger Learning (Ingest Docs)
If you add new PDFs/MDs to `docs/`:
```bash
curl -X POST http://localhost:8000/api/v1/learn
```

---

## 3. How to Manage Capabilities

### A. Updating Rules (SEAL Protocol)
When a marina rule changes (e.g., "Speed limit is now 5 knots"):
1.  **Action**: Tell Ada in the chat: *"Update rule: The speed limit inside the marina is now 5 knots."*
2.  **Internal Process**:
    *   The **Router** detects `LEARNING` intent.
    *   **SEAL Node** activates.
    *   It generates synthetic scenarios ("Is 4 knots okay? Yes. Is 6 knots okay? No.").
    *   It injects these into the System Prompt for future turns.

### B. Forecasting (TabPFN Protocol)
When you need to predict future occupancy.
1.  **Action**: Tell Ada: *"Predict occupancy for next month."*
2.  **Internal Process**:
    *   The **Router** detects `ANALYTICS` intent.
    *   **TabPFN Node** activates.
    *   It returns a probability distribution based on internal tabular models.

### C. Calculations (Worker Protocol)
1.  **Action**: Tell Ada: *"Calculate 250 * 1.5 * 1.2"* (Mooring fee formula).
2.  **Internal Process**:
    *   The **Router** detects `MATH` intent.
    *   **Calculator Node** executes Python code.
    *   **Result:** Zero Hallucination. Precise float value returned.

---

## 4. Troubleshooting

*   **"System Alert: Neural Link Unstable"**: This means the Python backend threw an exception. Check logs:
    `docker logs ada_core_hyperscale`
*   **Memory Loss**: If Ada answers generic info instead of WIM rules, ensure Qdrant is running and trigger the `/api/v1/learn