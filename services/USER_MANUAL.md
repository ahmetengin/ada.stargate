
# 📘 Ada Stargate: Hyperscale User Manual

**Version:** 4.0 (The Cognitive OS)
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
*Expected Output:* `{"status": "operational", "nodes": ["LangGraph", "TabPFN", "SEAL"]}`

---

## 3. How to Manage Capabilities

### A. Updating Rules (SEAL Protocol)
When a marina rule changes (e.g., "Speed limit is now 5 knots"), you do not need to rewrite code.
1.  **Action**: Tell Ada in the chat: *"Update policy: The speed limit inside the marina is now 5 knots."*
2.  **Internal Process**:
    *   The **Router** detects a rule change intent.
    *   **SEAL Node** activates.
    *   It retrieves the old context from **Qdrant**.
    *   It generates synthetic scenarios ("Is 4 knots okay? Yes. Is 6 knots okay? No.").
    *   It injects these into the System Prompt for future turns.

### B. Forecasting (TabPFN Protocol)
When you need to predict future occupancy.
1.  **Action**: Tell Ada: *"Predict occupancy for next month."*
2.  **Internal Process**:
    *   The **Router** detects analytical intent.
    *   **Analytics Node** activates.
    *   It pulls historical CSV data (occupancy vs weather).
    *   **TabPFN** (Transformer for Tabular Data) runs inference.
    *   It returns a probability distribution (e.g., "94% (+/- 2%)").

---

## 4. Troubleshooting

*   **"System Alert: Neural Link Unstable"**: This means the Python backend threw an exception. Check logs:
    `docker logs ada_core_hyperscale`
*   **Memory Loss**: If Ada forgets a rule you just taught her, verify **Redis** persistence is active in `docker-compose.hyperscale.yml`.

---

**"The World is Beautiful When Nodes Talk."**
    