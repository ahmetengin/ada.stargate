# 🟢 Active Track: OneNet IoT Pipeline Implementation

## Objective
Establish a robust, persistent telemetry bridge for both Sea (vessel) and Marina (facility) sensors using MQTT, Telegraf, and InfluxDB.

## Current Tasks
- [x] Infrastructure definition in `docker-compose.hyperscale.yml`.
- [x] Telegraf configuration for MQTT-to-InfluxDB mapping (`telegraf.conf.md`).
- [x] Python reflex listener for real-time LangGraph state updates (`sea_listener.py.md`).
- [ ] Integration of InfluxDB query tool into `Ada.Marina` Expert.
- [ ] Real-time visualization of OneNet telemetry in the `Canvas.tsx` HUD.

## Technical Specifications
- **MQTT Topic Pattern:** `signalk/vessels/self/#` (Standard SignalK OneNet format).
- **Storage:** InfluxDB v2, Bucket: `signalk`, Org: `wim`.
- **Logic:** `sea_listener.py` acts as Ada's "ears" on the network, pushing critical `Observations` (e.g., low depth, high wind) to the LangGraph brain for immediate action.
