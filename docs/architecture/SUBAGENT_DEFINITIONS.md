
# 🤖 Phase 6: Subagent Definitions (12)

This matrix defines the specialized workforce within the Ada Stargate ecosystem. 
Each agent is a sovereign node within the LangGraph architecture.

| Agent | File | Purpose | Key Tools |
| :--- | :--- | :--- | :--- |
| **semantic-router** | `backend/orchestrator/router.py` | Classifies intent & directs traffic | `Gemini-Flash`, `IntentClassifier` |
| **berth-allocator** | `backend/workers/marina_berth.py` | Optimizes boat parking via physics | `calculate_optimal_berth`, `check_depth` |
| **traffic-controller** | `backend/workers/marina_traffic.py` | Monitors AIS/Radar collision risks | `scan_radar_sector`, `colregs_analyzer` |
| **yield-strategist** | `backend/workers/finance_yield.py` | Predicts demand & sets pricing | `TabPFN_Predictor`, `competitor_scrape` |
| **ledger-architect** | `backend/workers/finance_invoice.py` | Zero-error billing & tax calculation | `MAKER_Python_Math`, `parasut_api` |
| **compliance-officer** | `backend/workers/legal_rag.py` | Checks contracts & regulations | `Qdrant_Vector_Search`, `ocr_scanner` |
| **sentinel-guard** | `backend/workers/security_vision.py` | Perimeter defense & drone watch | `YOLO_Object_Detect`, `mqtt_gate_lock` |
| **seal-learner** | `backend/orchestrator/seal.py` | Ingests new rules & updates prompts | `Self_Reflection`, `Prompt_Rewriter` |
| **maker-engineer** | `backend/orchestrator/maker.py` | Writes Python scripts for complex math | `Python_Sandbox`, `Unit_Tester` |
| **concierge-logistics** | `backend/workers/services_travel.py` | Manages VIP transfers & provisions | `PassKit_Issuer`, `flight_search_amadeus` |
| **facility-manager** | `backend/workers/marina_iot.py` | Controls physical assets (IoT) | `mqtt_pedestal_switch`, `blue_flag_sensor` |
| **voice-operator** | `backend/vhf_radio.py` | Handles real-time audio (VHF) | `FastRTC_Stream`, `Speech_to_Text` |

## 🧠 Domain Mapping

1.  **ADA.MARINA:** `berth-allocator`, `traffic-controller`, `facility-manager`
2.  **ADA.FINANCE:** `yield-strategist`, `ledger-architect`
3.  **ADA.LEGAL:** `compliance-officer`, `sentinel-guard`
4.  **ADA.STARGATE:** `semantic-router`, `seal-learner`, `maker-engineer`
