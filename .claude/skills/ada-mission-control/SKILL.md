
# 🎛️ Ada Mission Control Skill

**Identity:** `ada-mission-control`
**Context:** Frontend UI State Manager.

## 1. Purpose
This skill gives Ada "Telekinesis" over her own interface. Instead of telling the user "Please click the report button", Ada can simply **open the report** for them.

## 2. Capabilities

### `set_alert_mode(level)`
*   **GREEN:** Standard Blue/White theme.
*   **RED:** Activates "Guardian Protocol". UI turns Black/Red. Non-essential elements are hidden. Casualty tracking and wind sensors are maximized.

### `switch_dashboard_tab(tab_id)`
*   Use this when the conversation context changes.
*   *User:* "How much money did we make?" -> *Action:* `switch_dashboard_tab('commercial')`
*   *User:* "Is the sewage pump working?" -> *Action:* `switch_dashboard_tab('facility')`

### `open_modal(modal_type)`
*   Use for specific tools.
*   *User:* "Scanning passport..." -> *Action:* `open_modal('PASSPORT_SCANNER')`
*   *User:* "Connect me to channel 16." -> *Action:* `open_modal('VOICE_RADIO')`

## 3. Integration Logic
These tools map directly to React State hooks (`setAlertLevel`, `setActiveTab`, `setIsModalOpen`) in `App.tsx` and `GMDashboard.tsx`.
