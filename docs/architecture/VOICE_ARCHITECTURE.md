
# 🗣️ ADA VOICE ARCHITECTURE: The Gateway Protocol

**Problem:** Docker containers cannot easily access host hardware (Microphone/Speakers) due to driver isolation and OS constraints.
**Solution:** "Browser as Gateway" Architecture.

---

## 1. The Core Conflict
*   **Docker:** Perfect for the "Brain" (API, DB, Logic, LangGraph).
*   **Host OS:** Perfect for "Senses" (Mic, Speaker, Camera).
*   **Issue:** Mounting `/dev/snd` into Docker is fragile and OS-dependent (Linux vs Mac vs Windows).

## 2. The Architecture: "Split Brain"

We separate the system into two distinct layers:

### Layer A: The Brain (Docker)
*   **Role:** Intelligence, Logic, Memory.
*   **Components:** Python Backend (`ada-core`), Postgres, Qdrant.
*   **Input:** Receives Text or Audio Bytes (via WebSocket).
*   **Output:** Sends Text or Audio Bytes.
*   **State:** Pure Software.

### Layer B: The Gateway (Browser / Host)
*   **Role:** The Mouth and Ears.
*   **Components:** React App (`VoiceModal`, `LiveSession`).
*   **Input:** Physical Microphone (Web Audio API).
*   **Output:** Physical Speakers.
*   **Logic:** 
    1.  Capture Audio (Browser).
    2.  Stream to Cloud/Backend (WebRTC/WebSocket).
    3.  Receive Response.
    4.  Play Audio.

---

## 3. Implementation Strategy (Browser-Based Voice)

### The "Hold to Talk" Protocol (PTT)
To mimic maritime radio operations and ensure privacy/control:
1.  **Default State:** Muted (Listening Mode).
2.  **Action:** User holds **PTT Button**.
3.  **Process:** Browser opens Mic gate -> Stream Audio -> Backend Processing.
4.  **Release:** Mic gate closes.

### Data Flow
```text
[ USER ] --(Voice)--> [ BROWSER (Gateway) ] --(WebSocket/WebRTC)--> [ DOCKER (Ada Core) ]
                                                                         |
                                                                    [ GEMINI API ]
                                                                         |
[ USER ] <--(Audio)-- [ BROWSER (Gateway) ] <--(Response)-- [ DOCKER (Ada Core) ]
```

## 4. Advantages
1.  **Universal Compatibility:** Works on iPad, Android Tablet, Mac, Windows without driver config.
2.  **Zero Latency:** Audio processing happens on the Edge (Browser) or direct Cloud link.
3.  **Docker Agnostic:** The backend container doesn't need to know *where* the audio comes from.

*Architectural decision logged: November 2025*
