
# 📡 SignalK MCP Integration Strategy

**Component:** `signalk-mcp-server`
**Role:** The Bridge between Physical Sensors (NMEA) and Cognitive AI (Ada).

## 1. Overview
Ada Stargate uses **SignalK** as the universal data bus for maritime telemetry. To allow the LLM agents (`ada.sea`, `ada.marina`) to interact with this data without writing custom API clients for every sensor, we utilize the **Model Context Protocol (MCP)**.

## 2. Architecture

```mermaid
graph LR
    A[NMEA 2000 Sensors] -->|CAN Bus| B[Gateway]
    B -->|UDP/USB| C[SignalK Server (Docker)]
    C -->|JSON API| D[SignalK MCP Server (Sidecar)]
    D -->|MCP Protocol (SSE)| E[Ada Core (Python)]
    E -->|Reasoning| F[User Response]
    
    G[MarineTraffic API] -->|HTTPS| C
```

## 3. Available Tools
The `signalk-mcp-server` automatically exposes the following tools to Ada:

*   **`get_vessel_data`**: Retrieve specific telemetry paths (e.g., `navigation.speedOverGround`, `environment.wind.speedApparent`).
*   **`list_vessels`**: See other vessels detected by AIS.
    *   **Local AIS:** Real-time, via antenna (Range: ~20nm).
    *   **Global AIS:** Delayed ~5min, via `signalk-marinetraffic-public` plugin (Range: Global).
*   **`get_server_info`**: Check SignalK server version and health.

## 4. Usage Scenarios

### Scenario A: "Is it safe to dock?"
1.  **User:** "Ada, check the wind. Is it safe to dock at Pontoon A?"
2.  **Ada Router:** Identifies need for live data.
3.  **Ada MCP Client:** Calls `get_vessel_data(paths=["environment.wind.speedApparent", "environment.wind.angleApparent"])`.
4.  **SignalK MCP:** Returns `{ speed: 18.5, angle: 45 }`.
5.  **Ada Logic:** "Wind is 18.5 knots from NW. Crosswind exceeds safety threshold (15kn)."
6.  **Response:** "Negative. Wind is 18.5 knots. Recommendation: Request Tug Assistance."

### Scenario B: "Where is Phisedelia?" (Global Tracking)
1.  **User:** "Locate S/Y Phisedelia."
2.  **Ada MCP Client:** Calls `list_vessels()` (AIS data).
3.  **SignalK Logic:** 
    *   Checks Local AIS. Not found.
    *   Queries `signalk-marinetraffic-public` plugin.
4.  **Result:** Found in mid-Aegean.
5.  **Response:** "S/Y Phisedelia is currently out of local range. Satellite fix places her near Skyros (38.8N, 24.5E), SOG 8.2kn."

### Scenario C: "Bathymetry Check (Roving Sensor Mesh)"
**The Tender Swarm Protocol:** Since tenders (`ada.sea.wimAlfa`, `ada.sea.wimBravo`) are constantly moving throughout the marina, they act as mobile sensor nodes.
1.  **User:** "Is the depth at Pontoon C-End sufficient for a 3m draft?"
2.  **Ada Router:** Queries historical data but finds it outdated.
3.  **Ada Action:** Checks logs from `Tender Bravo` which passed that sector 10 mins ago.
4.  **SignalK MCP:** Returns `environment.depth.belowTransducer` history for Tender Bravo.
5.  **Ada Logic:** "Tender Bravo recorded 4.2m depth at C-End at 14:00."
6.  **Response:** "Yes. Live bathymetry confirms 4.2m clearance. Safe for maneuver."

## 5. Configuration
The integration is defined in `docker-compose.hyperscale.yml`.
*   **Ada Core** environment: `MCP_SIGNALK_URL=http://ada-signalk-mcp:3002/sse`
*   **Plugins:** `signalk-marinetraffic-public` is installed on startup to bridge global data.
