
# 📡 SignalK MCP Integration Strategy

**Component:** `signalk-mcp-server`
**Role:** The Bridge between Physical Sensors (NMEA) and Cognitive AI (Ada).

## 1. Overview
Ada Stargate uses **SignalK** as the universal data bus for maritime telemetry. To allow the LLM agents (`ada.sea`, `ada.marina`) to interact with this data without writing custom API clients for every sensor, we utilize the **Model Context Protocol (MCP)** for pull requests and **MQTT** for push streams.

## 2. Architecture

```mermaid
graph LR
    A[NMEA 2000 Sensors] -->|CAN Bus| B[Gateway]
    B -->|UDP/USB| C[SignalK Server (Docker)]
    C -->|JSON API| D[SignalK MCP Server (Sidecar)]
    C -->|MQTT Push| J[MQTT Broker (ada-mqtt)]
    D -->|MCP Protocol (SSE)| E[Ada Core (Python)]
    J -->|Sub| E
    E -->|Reasoning| F[User Response]
    
    G[MarineTraffic API] -->|HTTPS| C
    H[Course Provider Plugin] -->|Logic| C
    I[OpenWeather API] -->|HTTPS| C
    K[Windy Plugin] -->|Web App| C
    L[WeatherFlow Tempest] -->|UDP| C
    M[CanboatJS] -->|Raw PGN Decode| C
    N[SignalK Racer] -->|Tactical Calc| C
    O[PostgSail] -->|Cloud Logbook| C
```

## 3. Available Tools & Plugins
The system is configured with the following plugins to maximize data reach:

*   **`signalk-mcp-server`**: Exposes `get_vessel_data`, `list_vessels` tools to LLMs.
*   **`signalk-mosquitto`**: Pushes SignalK delta updates to the MQTT Broker (`mqtt://ada-mqtt:1883`).
*   **`signalk-marinetraffic-public`**: Fetches global AIS data.
*   **`@signalk/course-provider`**: Calculates Navigation Logic (ETA, XTE, Bearing).
*   **`openweather-signalk`**: Injects Meteorological Data (Forecast, Pressure).
*   **`signalk-windy-plugin`**: Provides a Windy.com weather map overlay.
*   **`signalk-weatherflow`**: Integrates the Tempest weather station (Haptic Rain, Lightning).
*   **`@canboat/canboatjs`**: Pure NMEA 2000 Decoder/Encoder.
*   **`signalk-racer`**: Tactical Sailing Computer (VMG, Polar).
*   **`signalk-postgsail` / `@xbgmsharp/postgsail-mcp-server`**: **(New)** Automated Logbook & Cloud Analytics.
    *   Trip History & Replay.
    *   Performance Metrics over Time.
    *   Digital Logbook Generation.

## 4. Usage Scenarios

### Scenario A: "Is it safe to dock?" (MCP Pull)
1.  **User:** "Ada, check the wind. Is it safe to dock at Pontoon A?"
2.  **Ada Router:** Identifies need for live data.
3.  **Ada MCP Client:** Calls `get_vessel_data(paths=["environment.wind.speedApparent", "environment.wind.angleApparent"])`.
4.  **Result:** "Wind is 18.5 knots from NW. Recommendation: Request Tug Assistance."

### Scenario B: "Navigation Check" (Course Provider)
**The Navigator Protocol:** Using the `@signalk/course-provider` plugin to calculate active route data.
1.  **User:** "What is our ETA to the next waypoint?"
2.  **Ada Router:** Calls `get_vessel_data(paths=["navigation.courseRhumbline.nextPoint"])`.
3.  **SignalK MCP:** Returns calculated data: `{ distance: 12.4, eta: "14:30", bearingTrue: 185 }`.

### Scenario C: "Hyper-Local Weather" (WeatherFlow)
**The Onboard Meteorologist:** Using `signalk-weatherflow` for immediate conditions.
1.  **User:** "Is it going to rain?"
2.  **Ada Router:** Checks `environment.outside.rainRate` via WeatherFlow.
3.  **SignalK MCP:** Returns `{ rainRate: 2.5 }` (mm/hr).
4.  **Response:** "Yes, it is currently raining. Intensity: 2.5 mm/hr. Lightning detected 12km away."

### Scenario D: "Tactical Sailing" (Racer Plugin)
**The Tactician:** Optimizing sailing performance for the Sailing School.
1.  **User:** "Are we sailing efficiently? What's our target angle?"
2.  **Ada Sea Agent:** Queries `performance.polarSpeed` and `performance.targetAngle`.
3.  **SignalK MCP:** Returns `{ polarSpeed: 8.2, speedOverGround: 7.1, targetAngle: 45 }`.
4.  **Response:** "We are at 86% efficiency. To reach max VMG, harden up to 45° True Wind Angle."

### Scenario E: "Logbook Lookup" (PostgSail)
**The Historian:** Accessing past trip data.
1.  **User:** "How long did it take to get from Göcek to Bodrum last week?"
2.  **Ada Sea Agent:** Uses `postgsail` tool to query trip history.
3.  **Result:** "Trip ID: 294. Duration: 14h 20m. Max Wind: 22kts. Avg Speed: 7.4kts."

## 5. Configuration
The integration is defined in `docker-compose.hyperscale.yml`.
*   **Ada Core** environment: `MCP_SIGNALK_URL=http://ada-signalk-mcp:3002/sse`, `MQTT_BROKER=ada-mqtt`
*   **Plugins:** 
    *   `signalk-marinetraffic-public`
    *   `@signalk/course-provider`
    *   `openweather-signalk`
    *   `signalk-mosquitto`
    *   `signalk-windy-plugin`
    *   `signalk-weatherflow`
    *   `signalk-racer`
    *   `signalk-postgsail`
