
# ⚓️ ADA STARGATE: COGNITIVE MARITIME OS (v5.0)

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-COGNITIVE_ENTITY-purple?style=for-the-badge&logo=docker)
![Architecture](https://img.shields.io/badge/ARCH-HYPERSCALE_BIG_4-blue?style=for-the-badge&logo=python)
![Interface](https://img.shields.io/badge/UI-MISSION_CONTROL-emerald?style=for-the-badge&logo=react)

</div>

## 🌊 Overview

**Ada Stargate**, marinalar ve otonom gemiler için tasarlanmış, **Federated (Dağıtık)** ve **Cognitive (Bilişsel)** bir işletim sistemidir.

Proje, **Hyperscale v5.0** mimarisine yükseltilmiştir. Eski "monolitik" yapı terk edilmiş, yerine **LangGraph** (Beyin) ve **FastAPI** (Omurga) tabanlı modern bir altyapı kurulmuştur.

---

## 🏗️ v5.0 Architecture: The "Big 4"

Sistem 4 ana uzmanlık alanına (Domain) ayrılmıştır:

1.  **ADA.MARINA (Operatör):** Fiziksel dünya. Bağlama, elektrik, su, atık, sensörler.
2.  **ADA.FINANCE (CFO):** Para. Fatura, tahsilat, sigorta, dinamik fiyatlama (Yield).
3.  **ADA.LEGAL (Hukuk):** Kurallar. Sözleşmeler, KVKK, güvenlik, ISPS.
4.  **ADA.STARGATE (Beyin):** Orkestrasyon. Sistem sağlığı, ağ, analitik, seyahat.

---

## 🚀 Key Technologies

*   **Frontend:** React 18 + Vite + Tailwind (Mission Control Dashboard)
*   **Backend:** Python 3.11 + FastAPI
*   **Cognition:** LangGraph (Stateful Orchestration)
*   **Execution:** MAKER Protocol (Python Code Generation for Math/Logic)
*   **Adaptation:** SEAL Protocol (Self-Learning from Rules)
*   **Prediction:** TabPFN (Small Data Analytics)
*   **Memory:** Qdrant (Vector DB) + Redis (Hot State) + Postgres (Truth)

---

## 💻 Installation (Clean Install)

### 1. Temizlik (Opsiyonel)
Eski kalıntıları temizlemek için:
```bash
npm run cleanup
```

### 2. Başlatma
```bash
docker-compose up --build -d
```

### 3. Erişim
*   **Mission Control:** `http://localhost:3000`
*   **API Health:** `http://localhost:3000/api/health`

---

## 📂 Project Structure

```text
/
├── backend/                 # THE BRAIN (Python)
│   ├── architecture_graph.py # LangGraph (Consciousness)
│   ├── ingest.py            # RAG Loader (Learning)
│   ├── main.py              # API Entry Point
│   └── Dockerfile           # Python Env
├── frontend/                # THE BODY (React - Root Dir)
│   ├── src/components/      # UI Components
│   ├── src/services/        # Agents & Logic
│   └── vite.config.ts       # Build Config
├── nginx/                   # THE GATEWAY
│   └── nginx.conf           # OneNet Config
├── docs/                    # KNOWLEDGE BASE
│   ├── ada.legal/           # Contracts & Rules
│   ├── ada.sea/             # COLREGs
│   └── architecture/        # Technical Docs
└── docker-compose.yml       # Infrastructure Definition
```

**"The World is Beautiful When Nodes Talk."**
