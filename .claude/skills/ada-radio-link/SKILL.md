
# 🎙️ Ada Radio Link Skill

**Identity:** `ada-radio-link`
**Backend:** FastRTC / Gradio (`backend/vhf_radio.py`)

## 1. Capability Overview
Controls the voice interface of Ada. This is not a standard STT/TTS API; it is a **Real-Time WebRTC Stream**.

## 2. Architecture
*   **Latency:** < 500ms (Local Moonshine STT + Local Kokoro TTS).
*   **Model:** Nano Agent (`backend/nano.py`) running Gemini Flash Lite.
*   **Endpoint:** `ws://ada-core:8000/radio/queue/join` (Internal WebRTC negotiation).

## 3. Usage
*   Use `broadcast_alert` to force Ada to speak something on the radio channel without a user prompt (e.g., proactive weather warning).
*   Use `get_radio_status` to verify if the microphone/speaker loop is active.

## 4. Limitations
*   This skill cannot "listen" to the audio stream directly (privacy/bandwidth). It interacts with the *control plane* of the radio, not the data plane.
