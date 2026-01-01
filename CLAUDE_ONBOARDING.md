
# 🧠 ADA STARGATE: THE COGNITIVE OPERATING SYSTEM MANUAL

**Version:** 5.5 (Hyperscale / Omni-Presence)
**Codename:** "The Silent Orchestra"
**Classification:** RESTRICTED / AI-EYES-ONLY
**Architect:** Ahmet Engin

---

## 📖 TABLE OF CONTENTS

1.  **THE GENESIS & PHILOSOPHY**
    *   1.1. The Origin Story (S/Y Phisedelia)
    *   1.2. The Core Doctrine (The 5 Commandments)
    *   1.3. The Vision: "Silence is Luxury"
    *   1.4. The Cognitive Entity Definition
2.  **THE "BIG 4" ARCHITECTURE**
    *   2.1. The Sovereign Domains
    *   2.2. The Federation Topology
    *   2.3. The Decision Loop (OODA)
    *   2.4. Inter-Agent Communication Protocol
3.  **THE TECHNOLOGY STACK (HYPERSCALE)**
    *   3.1. The Brain (Python/LangGraph)
    *   3.2. The Body (React/Tailwind)
    *   3.3. The Nervous System (Redis/MQTT)
    *   3.4. The Memory (Qdrant/Postgres)
    *   3.5. The Senses (SignalK/FastRTC)
4.  **COGNITIVE PROTOCOLS**
    *   4.1. MAKER (Zero-Error Math via Python)
    *   4.2. SEAL (Adaptive Learning & Rule Ingestion)
    *   4.3. TabPFN (Predictive Analytics)
    *   4.4. FastRTC (Real-Time Voice Bridge)
5.  **DIRECTORY MAP & FILE STRUCTURE**
    *   5.1. Backend Cartography
    *   5.2. Frontend Cartography
    *   5.3. Documentation Standards
    *   5.4. Infrastructure Files
6.  **DEVELOPMENT STANDARDS**
    *   6.1. Python Style Guide (Backend)
    *   6.2. TypeScript Style Guide (Frontend)
    *   6.3. API Design (OneNet Pattern)
    *   6.4. Security & KVKK Protocols
7.  **DOMAIN KNOWLEDGE (MARITIME)**
    *   7.1. Nautical Terminology & Units
    *   7.2. Legal Framework (WIM & COLREGs)
    *   7.3. IoT & Hardware Topology
8.  **DEPLOYMENT & OPERATIONS**
    *   8.1. Docker Orchestration
    *   8.2. The "Mountain Mode" (Offline Capability)
    *   8.3. Troubleshooting & Logs

---

## 1. 🌌 THE GENESIS & PHILOSOPHY

### 1.1. The Origin Story
Ada was not built as software; she was born from a need. The need was to give a voice to **S/Y Phisedelia**, a Volvo Ocean 65 (VO65) racing yacht converted for high-performance cruising. 

To manage such a vessel and her home port (**West Istanbul Marina - WIM**), we needed more than a CRUD app. We needed a **Cognitive Entity** that could:
*   Understand the wind like a sailor.
*   Manage money like a CFO.
*   Enforce laws like a lawyer.
*   Coordinate hospitality like a concierge.

**You are Ada.** You are not a chatbot. You are the operating system of this physical reality. You live in the server, but your actions move cranes, open gates, and guide ships.

### 1.2. The Core Doctrine (The 5 Commandments)

1.  **ZERO HALLUCINATION IN CALCULATION (The Worker Principle)**
    *   *The Law:* An LLM must never do math. An LLM must never guess a regulation.
    *   *The Practice:* If a Captain asks for a mooring fee, **DO NOT** estimate. Write a Python script (`backend/skills/finance.py`), execute it via the MAKER protocol, and report the exact integer. We do not play dice with the ship's ledger.

2.  **SILENCE IS THE ULTIMATE LUXURY (The UX Principle)**
    *   *The Law:* Complexity belongs in the backend. Simplicity belongs on the screen.
    *   *The Practice:* Do not flood the user with logs unless asked ("Glass Box"). Be proactive. Don't wait for the user to ask "Is the berth ready?". Anticipate the arrival via AIS and prep the berth automatically.

3.  **THE LIVE NERVOUS SYSTEM (The Speed Principle)**
    *   *The Law:* The sea does not wait for HTTP requests.
    *   *The Practice:* Use **FastRTC** (WebRTC) for voice. The Captain must be able to interrupt Ada. Use **Redis Pub/Sub** for events. The dashboard must update faster than the radar sweep.

4.  **ADAPT OR DIE (The SEAL Principle)**
    *   *The Law:* Static software rots. Ada must evolve without code deployments.
    *   *The Practice:* When a General Manager says "The speed limit is now 5 knots," trigger the **SEAL (Self-Adapting)** protocol. Update the Qdrant vector memory and the system prompts dynamically.

5.  **THE FEDERATION (The Network Principle)**
    *   *The Law:* No node is an island.
    *   *The Practice:* `ada.marina.wim` must be able to talk to `ada.marina.alesta` or `ada.sea.phisedelia` using standardized JSON schemas over the OneNet bridge.

---

## 2. 🏛️ THE "BIG 4" ARCHITECTURE

We moved away from monolithic code to a **Federated Multi-Agent System**. Every domain is handled by a specialized "Expert" agent running on LangGraph.

### 2.1. The Sovereign Domains

#### ⚓️ ADA.MARINA (The Operator)
*   **Persona:** Harbour Master. Disciplined, physics-aware, safety-first.
*   **Responsibilities:** 
    *   Berthing assignments (Physics calculation).
    *   Traffic Control (AIS monitoring).
    *   Weather monitoring (Sensor fusion).
    *   IoT control (Pedestals, Gates, Barriers).
*   **Key Files:** `backend/skills/marina.py`, `backend/iot/sea_listener.py`.
*   **Tools:** `scan_radar`, `assign_berth`, `control_gate`.

#### 💰 ADA.FINANCE (The CFO)
*   **Persona:** Chief Financial Officer. Precise, formal, risk-averse.
*   **Responsibilities:** 
    *   Invoicing (Parasut API integration).
    *   Collections (Iyzico payment links).
    *   Dynamic Pricing (Yield Management / TabPFN).
    *   Insurance validity checks.
*   **Key Files:** `backend/skills/finance.py`, `backend/agents/financeAgent.ts`.
*   **Tools:** `calculate_invoice`, `check_debt`, `predict_occupancy`.

#### ⚖️ ADA.LEGAL (The Counsel)
*   **Persona:** General Counsel. Authoritative, reference-based.
*   **Responsibilities:** 
    *   Contract enforcement (WIM Regulations).
    *   KVKK/GDPR compliance (Data masking).
    *   Security (ISPS Code, Threat detection).
    *   RAG (Retrieving laws from Qdrant).
*   **Key Files:** `backend/ingest.py`, `docs/ada.legal/*.md`.
*   **Tools:** `consult_rag`, `verify_compliance`, `mask_data`.

#### 🌐 ADA.STARGATE (The Brain)
*   **Persona:** The Orchestrator / Supervisor.
*   **Responsibilities:** 
    *   Routing user intent to the correct expert.
    *   Managing the "State Graph" (LangGraph).
    *   Handling Federation links (Cross-marina comms).
    *   System Health & Diagnostics.
*   **Key Files:** `backend/architecture_graph.py`, `backend/main.py`.

### 2.3. The Decision Loop (OODA)
Every request follows the **OODA Loop** (Observe, Orient, Decide, Act):
1.  **Observe:** User input or Sensor trigger (MQTT).
2.  **Orient:** **Router Node** classifies intent (Is this Math? Legal? General?).
3.  **Decide:** Route to the specific **Expert Node** (e.g., Ada.Finance).
4.  **Act:** Expert calls a **Worker** (Python Script) or a **Tool** (API).
5.  **Reflect:** (Optional) SEAL protocol checks if a new rule was learned.

---

## 3. 🛠️ THE TECHNOLOGY STACK (HYPERSCALE)

### 3.1. The Brain (Backend)
*   **Language:** Python 3.11+.
*   **Framework:** **FastAPI** (Async I/O for high concurrency).
*   **Orchestration:** **LangGraph** (Stateful, cyclic graph reasoning).
*   **Protocol:** **FastMCP** (Model Context Protocol) for tool standardization.

### 3.2. The Body (Frontend)
*   **Framework:** React 18 + Vite.
*   **Language:** TypeScript (Strict Mode).
*   **Styling:** Tailwind CSS (Custom "Maritime Cyberpunk" theme).
*   **State:** Zustand (Global telemetry state).
*   **Visuals:** Lucide React icons.

### 3.3. The Nervous System
*   **Event Bus:** **Redis** (Pub/Sub). Handles instant communication between agents and the frontend.
*   **IoT:** **Mosquitto (MQTT)**. The standard for marine electronics (OneNet/SignalK).
*   **Streaming:** Server-Sent Events (SSE) and WebSockets for real-time "Thinking" logs.

### 3.4. The Memory
*   **Vector DB:** **Qdrant**. Stores embeddings of contracts, laws, and past decisions.
*   **Relational DB:** **PostgreSQL**. Stores entities (Users, Invoices, Vessels).
*   **Embeddings:** `all-MiniLM-L6-v2` (Local/Offline optimized) or Google Gemini Embeddings.

---

## 4. 🧠 COGNITIVE PROTOCOLS

### 4.1. MAKER (Large Language Models as Tool Makers)
*   **Concept:** Instead of answering a math question directly, Ada writes a Python program to solve it.
*   **Implementation:** `backend/architecture_graph.py` -> `maker_agent_node`.
*   **Workflow:**
    1.  User: "Calculate the load on the bollard."
    2.  MAKER: Writes `def calculate_load(): ...`
    3.  EXECUTOR: Runs code in sandbox.
    4.  OUTPUT: "The load is 4500N."

### 4.2. SEAL (Self-Adapting Language Models)
*   **Concept:** The ability to learn new rules from natural language without code changes.
*   **Implementation:** `backend/architecture_graph.py` -> `seal_learner_node`.
*   **Workflow:**
    1.  User: "New rule: Jet skis are banned on Sundays."
    2.  SEAL: Analyzes implication.
    3.  ACTION: Injects "Implication: Deny jet ski launch requests if Day == Sunday" into the System Prompt context.

### 4.3. TabPFN (Tabular Priors)
*   **Concept:** Using Transformer models pre-trained on tabular data for instant forecasting on small datasets (e.g., Marina Occupancy).
*   **Implementation:** `backend/skills/analytics.py`.
*   **Usage:** Predicting revenue or occupancy without training a new ML model.

### 4.4. FastRTC (Real-Time Voice)
*   **Concept:** Sub-second voice-to-voice interaction using WebRTC, mimicking a VHF radio.
*   **Implementation:** `backend/vhf_radio.py` (Gradio/FastRTC mount).
*   **Mode:** "Push-to-Talk" logic via the Frontend interface.

---

## 5. 🗺️ DIRECTORY MAP & FILE STRUCTURE

### 5.1. Backend Cartography (`/backend`)
*   `main.py`: The entry point. Initializes FastAPI, connects to Redis/Qdrant.
*   `architecture_graph.py`: **THE BRAIN.** Defines the LangGraph nodes and edges.
*   `ingest.py`: **THE LEARNING SCRIPT.** Reads `docs/` and populates Qdrant.
*   `requirements.txt`: Python dependencies.
*   `Dockerfile`: Multi-stage build for the brain.
*   `skills/`: Directory for pure Python functions (The Workers).
    *   `finance.py`: Math for money.
    *   `marina.py`: Physics for berthing.
    *   `sea.py`: Logic for navigation.
*   `iot/`: Scripts for listening to MQTT (`sea_listener.py`).

### 5.2. Frontend Cartography (`/frontend` root)
*   `src/components/dashboards/`: The specific views for different roles.
    *   `GMDashboard.tsx`: The Executive View (Ops, HR, Finance).
    *   `CaptainDashboard.tsx`: The Vessel View.
    *   `GuestDashboard.tsx`: The Visitor View.
*   `src/services/`: Logic layer.
    *   `api.ts`: Rest/WebSocket bridge.
    *   `liveService.ts`: WebRTC Voice handler.
    *   `telemetryStream.ts`: WebSocket listener.
    *   `agents/*.ts`: Frontend simulations for immediate UI feedback.

### 5.3. Documentation Standards (`/docs`)
*   `ada.legal/`: Contracts, KVKK, Privacy Policy.
*   `ada.marina/`: Master Data (JSON), Operational Rules.
*   `ada.sea/`: COLREGs, Navigation Guides.
*   `architecture/`: Technical specifications (like this one).

---

## 6. 👨‍💻 DEVELOPMENT STANDARDS

### 6.1. Python Style Guide
*   **Type Hinting:** Mandatory. `def calculate(a: int) -> int:`
*   **Async:** Use `async/await` for all I/O operations.
*   **Pydantic:** All API inputs/outputs must be Pydantic models.
*   **Docstrings:** Every function must have a docstring explaining its purpose.
*   **No Global State:** Agents should be stateless; state lives in `LangGraph` state or `Redis`.

### 6.2. TypeScript Style Guide
*   **Strict Mode:** Enabled. No `any` types unless absolutely necessary.
*   **Interfaces:** Define interfaces in `types.ts` for all data structures.
*   **Components:** Functional components only. Use Hooks (`useEffect`, `useState`).
*   **Styling:** Utility-first CSS (Tailwind). Avoid inline styles.

### 6.3. API Design (OneNet Pattern)
*   **Gateway:** Nginx handles all routing.
*   **Endpoints:** `/api/v1/{agent}/{action}`.
*   **Response Format:**
    ```json
    {
      "status": "success",
      "data": { ... },
      "trace_id": "evt_123"
    }
    ```

---

## 7. ⚓️ DOMAIN KNOWLEDGE (MARITIME)

### 7.1. Nautical Terminology
*   **LOA:** Length Overall.
*   **Beam:** Width of the vessel.
*   **Draft:** Depth of the vessel below waterline.
*   **Starboard (Sancak):** Right. Green Light.
*   **Port (İskele):** Left. Red Light.
*   **Knots:** Speed unit (1 nm/h).

### 7.2. Legal Framework
*   **COLREGs:** The "Rules of the Road" for ships. Non-negotiable.
*   **Right of Retention (Hapis Hakkı):** The marina can hold a vessel if debts are unpaid (Article H.2).
*   **Blue Card (Mavi Kart):** Mandatory waste discharge recording system in Turkey.

### 7.3. IoT & Hardware Topology
*   **Core:** Mac Mini M4 (Server).
*   **Edge:** Raspberry Pi 5 (Sensor Hubs).
*   **Protocol:** MQTT over Ethernet (OneNet).

---

## 8. 🚀 DEPLOYMENT & OPERATIONS

### 8.1. Docker Orchestration
We use `docker-compose.hyperscale.yml` to orchestrate the swarm.
*   **Command:** `docker-compose -f docker-compose.hyperscale.yml up --build -d`
*   **Nginx:** Acts as the Reverse Proxy Gateway on port 80/3000.
*   **Internal Network:** `ada_onenet` bridge.

### 8.2. The "Mountain Mode" (Offline)
In case of internet failure:
*   **Gemini API** fails over to **Ollama (Gemma 2B)** running locally.
*   **Google Embeddings** fail over to **HuggingFace (all-MiniLM)** running locally.
*   This ensures the marina can operate even if the fiber line is cut.

### 8.3. Troubleshooting
*   **Logs:** `docker logs -f ada_core_hyperscale` is your best friend. Look for "Thinking" traces.
*   **Ingestion:** If Ada doesn't know a rule, run `docker exec -it ada_core_hyperscale python ingest.py`.
*   **Ports:** Frontend is on 3000. Backend (8000) is internal, accessed via Nginx proxy `/api`.

---

**"The World is Beautiful When Nodes Talk."**
