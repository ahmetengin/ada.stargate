
# 🏛️ Ada Stargate: Hardware Topology (Edge-Hybrid)

**Core:** Mac Mini M4 (The Brain)
**Edge:** Raspberry Pi 5 / CM5 (The Senses)
**Network:** Gigabit Ethernet (Cat6)

## 1. Network Map

```text
[ INTERNET ] <--> [ ROUTER / SWITCH (192.168.1.1) ]
                        |
    +-------------------+-----------------------+
    |                                           |
[ MAC MINI M4 (192.168.1.100) ]       [ RASPBERRY PI 5 - Pontoon A (192.168.1.101) ]
    | Runs:                                 | Runs:
    | - Docker (Ada Core)                   | - Docker (Ada Satellite)
    | - MQTT Broker                         | - Cameras (RTSP Stream)
    | - Database (Postgres)                 | - Weather Sensors (GPIO/I2C)
    | - Local LLM (Moonshine)               | - Gate Relays
```

## 2. Communication Protocol

### A. Telemetry (Pi -> Mac)
*   **Protocol:** MQTT (Pub/Sub)
*   **Frequency:** Real-time (push on change) or polled (1Hz).
*   **Data:** Sensor readings, gate status, unauthorized motion alerts.

### B. Commands (Mac -> Pi)
*   **Protocol:** MQTT
*   **Action:** When Ada decides to open a gate, she publishes to `wim/gate/A/set` with payload `OPEN`. The Pi subscribes to this and triggers the GPIO.

### C. Video (Pi -> Mac)
*   **Protocol:** RTSP (Real Time Streaming Protocol)
*   **Flow:** Pi runs `rtsp-simple-server` or direct FFmpeg stream. Mac runs YOLOv10 on the incoming stream for object detection.

## 3. Setup Guide

### Mac Mini (Hub)
1.  Assign Static IP: `192.168.1.100`
2.  Run: `docker-compose -f docker-compose.hyperscale.yml up -d`

### Raspberry Pi (Satellite)
1.  Install Docker.
2.  Copy `iot/` folder to Pi.
3.  Edit `docker-compose.satellite.yml`: Set `HUB_IP` to `192.168.1.100`.
4.  Run: `docker-compose -f docker-compose.satellite.yml up -d`
