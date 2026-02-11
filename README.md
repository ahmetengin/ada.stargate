
# ⚓️ Ada Stargate: Hyperscale Cognitive OS (v5.5)

Ada is a federated multi-agent system designed to act as the cognitive heart of marina operations and vessel navigation.

## 🏗️ Architecture: The "Big 3" Pattern

- **Router**: The central LangGraph orchestrator that classifies intent.
- **Experts**: Sovereign domain agents (Marina, Finance, Legal, Stargate).
- **Workers**: Deterministic execution environments for math and IoT commands.

## 📂 Project Structure

- `backend/`: Python brain (FastAPI + LangGraph).
- `components/`: React UI components categorized by domain.
- `docs/`: Unified context source for RAG knowledge.
- `services/`: Logic layer handling API, WebRTC, and telemetry.
- `nginx/`: Secure OneNet gateway config.

## 🚀 Quick Start (Production)

1. Configure `.env` with your `API_KEY`.
2. Launch the stack:
   ```bash
   docker-compose -f docker-compose.hyperscale.yml up --build -d
   ```
3. Ingest knowledge base:
   ```bash
   docker exec -it ada_core_hyperscale python ingest.py
   ```

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
