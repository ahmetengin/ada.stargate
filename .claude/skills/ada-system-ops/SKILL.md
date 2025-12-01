# Ada System Ops Skill

**Identity:** `ada-system-ops`
**Purpose:** Administrative control over the Ada Stargate Operating System configuration and assets.

## Capabilities
This skill allows the agent to:
1.  **Modify Rules:** Change global operational parameters (e.g., speed limits, debt thresholds) dynamically without code deployment.
2.  **Register Assets:** Add new physical entities (Tenders, Patrol Boats) to the active fleet registry.

## When to Use
- When the user explicitly requests a policy change (e.g., "Set speed limit to 5 knots").
- When a new physical asset is acquired (e.g., "We bought a new tender named Charlie").
- **NEVER** use this for temporary or session-based variables. This modifies the persistent `localStorage` configuration.

## Tool Definitions
- `update_operational_rule(rule_key, value)`: Patches the `dynamic_rules_override` configuration.
- `register_new_asset(type, name)`: Adds an entry to the `ada_tenders_v1` registry.

## Security Level
**CRITICAL.** Requires `GENERAL_MANAGER` role authorization in the Orchestrator layer before invocation.