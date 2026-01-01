
# 🛡️ ADA STARGATE PERMISSIONS (RBAC)

This file defines which Agent can access which Tool/Data.

| Agent | Level | Can Read | Can Write | Physical Access |
| :--- | :--- | :--- | :--- | :--- |
| **ada.stargate** | 5 (ROOT) | ALL | ALL | YES (Reboot) |
| **ada.finance** | 4 | Ledger, Bank | Invoices | NO |
| **ada.legal** | 4 | Contracts | Blacklist | NO |
| **ada.marina** | 3 | Sensor, AIS | Gates, Power | YES (IoT) |
| **ada.technic** | 3 | Maint. Logs | Work Orders | YES (Lifts) |
| **ada.security** | 3 | Cameras | Lock/Unlock | YES (Barriers) |
| **ada.concierge**| 2 | Menus, Taxi | Reservations | NO |

## Critical Constraints
1. **Departure Ban:** Only `ada.finance` or `ada.legal` can trigger Article H.2 (Right of Retention).
2. **Gate Unlock:** Requires `ada.marina` or `ada.security`.
3. **Data Masking:** All logs readable by `ada.concierge` MUST be masked (KVKK).
