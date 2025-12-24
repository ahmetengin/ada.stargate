# ⚓️ ADA STARGATE: Project Context (v5.2)

## 🌌 Vision
Ada is a **Cognitive Operating System** for the maritime industry. It acts as a sentient bridge between high-stakes maritime operations (Sea) and hospitality/commercial management (Marina).

## 🏗️ Architecture: The "OneNet" Philosophy
- **IP-Native Backbone:** Moving away from legacy serial NMEA2000 to an all-IP native backbone (NMEA OneNet). 
- **Federated Nodes:** Every vessel (`ada.sea`) and every marina (`ada.marina`) is a sovereign node in a global intelligence mesh.
- **Big 4 Experts:**
    1. **Ada.Marina (The Operator):** Manages the physical world—berthing, sensors, and facilities.
    2. **Ada.Finance (The CFO):** Manages the ledger, dynamic pricing (Yield), and high-security payments.
    3. **Ada.Legal (The Counsel):** Enforces maritime regulations (COLREGs), contracts, and security.
    4. **Ada.Stargate (The Brain):** Orchestrates cross-node communication and global federation.

## 🛠️ Tech Stack
- **Frontend:** React 18 + Vite + Tailwind (The "Mission Control" Interface).
- **Backend:** Python 3.11 (FastAPI) + LangGraph (The "Cognition" Engine).
- **Sensory System:** 
    - **MQTT:** Real-time sensor bus for OneNet telemetry.
    - **InfluxDB:** Long-term time-series history for all vessel/marina data.
- **Memory Layer:**
    - **PostgreSQL:** Relational truth (Invoices, User Profiles).
    - **Qdrant:** Semantic memory for RAG (Contracts, Laws).
    - **Redis:** Hot state and real-time Event Bus.

## ⚔️ Doctrine (The 5 Commandments)
1. **Zero Hallucination:** Deterministic math and rules via Python Workers.
2. **Silence is Luxury:** Proactive, non-intrusive UI/UX.
3. **Low Latency:** Sub-second response for safety-critical tasks.
4. **Self-Adaptation:** SEAL Protocol for dynamic rule learning.
5. **Universal Mesh:** "The World is Beautiful When Nodes Talk."
