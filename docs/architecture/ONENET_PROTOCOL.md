# ⚓️ ADA ONENET PROTOCOL (Architecture v5.1)

**Concept:** "The Single Wire Philosophy"
**Inspiration:** NMEA OneNet (IP-based Marine Electronics Standard)

## 1. The Problem (The Spaghetti Era)
Previously, Ada exposed 7+ ports to the host machine (8000, 6333, 6379, 5432...). This is like a boat having 7 different VHF radios for 7 different channels. It is insecure and hard to manage.

## 2. The Solution (OneNet Gateway)
We have implemented a **Reverse Proxy Gateway (Nginx)** that acts as the single entry point (`:3000` or `:80`) for the entire ecosystem.

### Topology
```mermaid
graph TD
    A[EXTERNAL WORLD / USER] -->|Port 3000| B(ADA GATEWAY / Nginx);
    
    subgraph "Private Docker Network: ada_onenet"
        B -->|/| C[Frontend (React)];
        B -->|/api| D[Brain (Python/FastAPI)];
        B -->|/ws| E[Telemetry (WebSockets)];
        B -->|/qdrant| F[Memory (Vector DB)];
        B -->|/mqtt| G[Sensors (Mosquitto)];
    end
    
    style B fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

## 3. Benefits
1.  **Security:** Database ports are no longer exposed to the internet/host network.
2.  **Simplicity:** You only need to open **one port** on your firewall/router.
3.  **Naming:** Internal services talk via DNS names (`ada-redis`, `ada-core`) on the `ada_onenet` bridge, eliminating IP conflicts.

## 4. How to Access Services
*   **Mission Control:** `http://localhost:3000`
*   **API:** `http://localhost:3000/api`
*   **Vector DB Panel:** `http://localhost:3000/qdrant/dashboard`
*   **Sensor Stream:** `ws://localhost:3000/mqtt`

This architecture makes Ada fully compliant with modern **Edge Computing** standards, ready for deployment on a single Marine Server (e.g., Yacht PC or Marina Server).
