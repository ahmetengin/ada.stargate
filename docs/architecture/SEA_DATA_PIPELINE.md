# 🌊 Ada.Sea: Live Data Pipeline Architecture (OneNet Edition)

**Objective:** To provide the `ada.sea` agent with real-time, persistent, and queryable maritime telemetry data from a modern, IP-based native backbone.

---

## 1. Component Overview

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Sensor Hub** | **SignalK / OneNet Gateway** | Aggregates all vessel sensor data onto an IP network. |
| **Publisher** | **signalk-mosquitto** | Publishes the unified data stream to an MQTT broker. |
| **Broker** | **Mosquitto** | The "Nervous System" that distributes sensor data in real-time. |
| **Collector** | **Telegraf** | Subscribes to MQTT and writes data into the time-series database. |
| **Database** | **InfluxDB** | The "Long-Term Memory" for sensor data history. |
| **Real-time Ear**| **`sea_listener.py`**| A Python script giving the LangGraph brain live awareness. |

---

## 2. Data Flow Diagram

```mermaid
graph TD
    subgraph "Vessel Sensor Network (OneNet)"
        A[Ethernet Switch] --> B(SignalK / OneNet Server);
        C[GPS/AIS] --> A;
        D[Wind/Depth Sensors] --> A;
    end

    subgraph "Docker Network: ada_onenet"
        B -- Publishes --> E{ada-mqtt Broker};
        E -- Subscribes --> F[Telegraf];
        E -- Subscribes --> G[Python: sea_listener.py];
        F -- Writes --> H[InfluxDB];
        G -- Pushes Observation --> I(LangGraph Brain);
    end

    style B fill:#06b6d4,stroke:#0891b2,color:#fff
    style E fill:#f59e0b,stroke:#d97706,color:#fff
    style H fill:#10b981,stroke:#059669,color:#fff
    style I fill:#3b82f6,stroke:#2563eb,color:#fff
```

### Flow Explanation:
1.  All vessel sensors connect to a central **OneNet Gateway** over a standard IP network (Ethernet).
2.  The gateway publishes a unified data stream to the **`ada-mqtt` broker**.
3.  **Telegraf** listens to MQTT and archives all data in **InfluxDB** for historical analysis.
4.  Simultaneously, the **`sea_listener.py` script** listens to the same MQTT stream, allowing the AI brain to react to events in **real-time**.

This architecture provides Ada with both a perfect memory of the past (InfluxDB) and a live connection to the present (MQTT), all running on a modern, robust IP backbone.
