
# 📱 D-MARIN MOBILE APP API SPECIFICATION (Powered by Ada)

**Version:** 1.0
**Protocol:** REST / WebSocket
**Auth:** OAuth2 (D-ID Global Login)

This document defines how the D-Marin Mobile App (iOS/Android) talks to the Ada Backend.

## 1. AUTHENTICATION & PROFILE
*   **POST /api/v1/mobile/login**: Exchange credentials for JWT.
*   **GET /api/v1/mobile/profile**: Returns User Profile + 'Happy Berth Days' Status.
    *   *Response:* `{ "tier": "PLATINUM", "free_days_remaining": 5, "home_marina": "TR_TUR" }`

## 2. SMART PEDESTAL CONTROL (IoT)
*   **GET /api/v1/mobile/pedestal/{id}**: Get status (Voltage, Amperage, Consumption).
*   **POST /api/v1/mobile/pedestal/{id}/toggle**: Turn Power/Water ON or OFF.
    *   *Constraint:* Only works if user is checked-in to the berth associated with the pedestal.

## 3. BOOKING & RESERVATIONS
*   **POST /api/v1/mobile/booking/create**:
    *   *Body:* `{ "marina_id": "GR_ZEA", "dates": ["2025-07-01", "2025-07-07"], "vessel_id": "IMO123" }`
    *   *Logic:* Ada checks availability, applies "Happy Berth Days" discount automatically.
*   **GET /api/v1/mobile/booking/list**: Show upcoming trips.

## 4. CONCIERGE & SERVICES
*   **POST /api/v1/mobile/chat**: Direct chat with Ada (Text/Voice).
    *   *Context:* App sends GPS coordinates automatically.
*   **POST /api/v1/mobile/service/request**:
    *   *Types:* "PUMPOUT", "CLEANING", "TECHNICAL", "GOLF_CART".

## 5. NOTIFICATIONS (Push)
*   **Event:** `WEATHER_ALERT` (Storm approaching specific marina).
*   **Event:** `BILL_READY` (Monthly invoice generated).
*   **Event:** `CHECK_IN_OPEN` (Geofence triggered upon arrival).

---

## 🚀 ADA'S ROLE
Ada is the **Headless CMS and Brain** for this app. The app is just a UI.
*   When a user clicks "Open Gate", Ada validates the request against the `ada.security` node and fires the MQTT command.
*   When a user asks "Is there space in Dubai?", Ada queries the global inventory.
