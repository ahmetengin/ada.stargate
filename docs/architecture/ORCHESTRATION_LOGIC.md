
# 🧠 Ada Orchestration Logic: The Supervisor Pattern

**Architecture:** LangGraph Supervisor (Multi-Agent System)
**Version:** 5.5

## 1. The Core Concept
Ada is not a single chatbot. She is a federation of 7 sovereign agents, managed by a central brain called **Ada.Stargate (The Supervisor)**.

### The Flow
1.  **Input:** User says "Dock Phisedelia and charge them."
2.  **Supervisor:** Analyzes intent. Sees two tasks: Docking (Marina) and Charging (Finance).
3.  **Route 1:** Sends state to `ada_marina`.
4.  **Marina Agent:** Assigns Berth C-12. Updates `operational_context`. Returns control to Supervisor (or hands off directly).
5.  **Supervisor:** Sees `context.status = "DOCKED"`. Routes to `ada_finance`.
6.  **Finance Agent:** Sees Berth C-12. Calculates fee. Generates Invoice.
7.  **Response:** "Vessel docked at C-12. Invoice of €1,250 sent."

## 2. The Agent Roster

| Agent ID | Persona | Responsibility |
| :--- | :--- | :--- |
| **Supervisor** | **Ada.Stargate** | The Router. Maintains global state. Decides who speaks next. |
| `ada_marina` | Harbour Master | Physics, Weather, Assets, Berthing. |
| `ada_finance` | CFO | Money, Invoices, Yield, Insurance. |
| `ada_legal` | Counsel | Contracts, Regulations, KVKK. |
| `ada_technic` | Engineer | Maintenance, Lift, Blue Card. |
| `ada_security`| Guardian | Access Control, CCTV, ISPS. |
| `ada_concierge`| Butler | Lifestyle, Taxi, Provisions. |
| `ada_hr` | Manager | Staff, Patrols, Rosters. |

## 3. State Management
The system uses a shared `MultiAgentState` dictionary passed between nodes:
```python
class MultiAgentState(TypedDict):
    messages: List[BaseMessage]      # Chat History
    next_agent: str                  # Routing Flag
    operational_context: Dict        # Shared Data (Vessel ID, Weather, Auth)
```

## 4. Handoff Protocols
Agents can perform **Direct Handoffs**.
*   *Example:* `ada_marina` detects a fuel leak. Instead of going back to Supervisor, it can route directly to `ada_security` for containment and `ada_legal` for reporting.

This architecture ensures **Zero Hallucination** because each agent is constrained to its specific domain tools and knowledge base.
