
# 🏛️ The "Big 4" Strategy: Grand Unification

**Concept:** Consolidating 20+ fragmented micro-agents into 4 powerful, sovereign Domain Experts.
**Goal:** Simplicity, Robustness, and Clear Separation of Concerns.

---

## 1. ⚓️ Ada.Marina ( The Operator )
**Responsibility:** The Physical World. If it floats, moves, or consumes energy, it belongs here.
**Merged Agents:** `marina`, `sea`, `technic`, `facility`, `berth`.

### MCP Tools (The Hands)
1.  `tool_scan_radar`: Queries Kpler/AIS for traffic.
2.  `tool_smart_berthing`: Calculates optimal parking spot based on physics.
3.  `tool_iot_control`: Toggles pedestals, barriers, and lights via MQTT.
4.  `tool_maintenance_scheduler`: Manages Travel Lift and service teams.
5.  `tool_weather_station`: Local sensor fusion.

---

## 2. 💰 Ada.Finance ( The CFO )
**Responsibility:** The Ledger. If it involves money, debt, or asset value, it belongs here.
**Merged Agents:** `finance`, `commercial`, `reservations`, `customer` (CRM).

### MCP Tools (The Hands)
1.  `tool_invoice_engine`: Generates PDF invoices via Parasut API.
2.  `tool_payment_gateway`: Generates 3D-Secure links via Iyzico.
3.  `tool_debt_check`: Instant balance inquiry.
4.  `tool_yield_optimizer`: Dynamic pricing calculation (TabPFN).

---

## 3. ⚖️ Ada.Legal ( The Counsel )
**Responsibility:** The Law. If it involves rules, contracts, or security, it belongs here.
**Merged Agents:** `legal`, `hr`, `security`, `passkit`.

### MCP Tools (The Hands)
1.  `tool_rag_search`: Semantic search in Qdrant (Contracts, COLREGs).
2.  `tool_seal_learner`: Ingests new rules and updates system prompts.
3.  `tool_compliance_audit`: Checks passports, visas, and blue cards.
4.  `tool_security_watch`: Analyze CCTV/YOLO events.

---

## 4. 🌐 Ada.Stargate ( The Brain )
**Responsibility:** The Orchestrator. It connects the user to the experts and the experts to the world.
**Merged Agents:** `orchestrator`, `federation`, `system`, `it`, `travel`, `analytics`.

### MCP Tools (The Hands)
1.  `tool_federation_link`: Talk to other marinas (Alesta, D-Marin).
2.  `tool_fast_rtc`: Handle low-latency voice streams.
3.  `tool_router`: Classify intent and delegate.

---

## 🚀 Migration Benefits
1.  **Lower Latency:** Fewer hops between agents.
2.  **Better Context:** Each "Big 4" agent has a deeper understanding of its specific domain.
3.  **Easier Maintenance:** Debugging `Ada.Finance` is easier than debugging 5 scattered scripts.
4.  **Scalability:** This structure maps directly to the "Big 3" Python backend, where each "Big 4" expert can become an independent microservice.
