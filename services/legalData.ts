
// services/legalData.ts

export const LEGAL_DOCUMENTS: Record<string, string> = {
  'wim_kvkk.md': `
# West Istanbul Marina Privacy Policy (KVKK / GDPR)

This document provides a general framework for West Istanbul Marina's compliance with the Law on the Protection of Personal Data (KVKK) and the General Data Protection Regulation (GDPR).

## 1. Introduction
As West Istanbul Marina, we place great importance on the protection of personal data. This policy explains how the personal data of our customers, employees, suppliers, and other relevant individuals are collected, processed, stored, and protected.

## 2. Data Controller Information
**Data Controller:** West Istanbul Marina
**Address:** Yakuplu Mah. Marmara Cad. No:1 Beylikdüzü / Istanbul
**Email:** kvkk@wim.com.tr

## 3. Collection and Processing of Personal Data
### 3.1. Categories of Personal Data Collected
*   **Identity Information:** Name, surname, T.R. identity number, passport number.
*   **Contact Information:** Phone number, email address, address.
*   **Financial Information:** Bank account details, credit card information (masked).
*   **Vessel Information:** Vessel name, registration number, size, type.
*   **Security Information:** Camera recordings, entry-exit records.

### 3.2. Purposes of Processing Personal Data
*   Providing and managing marina services.
*   Fulfillment of contracts.
*   Compliance with legal obligations.
*   Ensuring security.

## 8. Data Masking & Anonymization Protocols
To enhance data security and comply with KVKK/GDPR, sensitive Personally Identifiable Information (PII) is masked in system outputs, logs, and general user interfaces.
`,
  'wim_contract_regulations.md': `
# WEST ISTANBUL MARINA OPERATION REGULATIONS

## A. PURPOSE
This Regulation specifies the principles of the management, operation and providing services at the marina.

## E. PRINCIPLES APPLYING TO YACHTS AND YACHT OWNERS

### E.1. ENTRY- EXIT & MOORING
E.1.1. The Yacht Owner is obliged to know the legislation and take the necessary precautions regarding the entry/exit of their Yacht.
E.1.2. Foreign-flag yachts may stay up to two years in Türkiye for maintenance, repair, docking or wintering purposes.
E.1.10. The Yacht shall navigate at a speed which shall be in conformity with the marine procedures (max 3 knots).

### E.2. USE OF THE OFFSHORE SITE
E.2.1. The Yacht must be covered under an applicable Third-Party Financial Liability insurance.
E.2.19. **CHANGE OF OWNERSHIP (VESSEL SALE) & RIGHT OF REFUSAL:** If the ownership of Yacht changes, the existing Contract is deemed terminated. The former Yacht Owner is not entitled to request any refund. The Contract **does not transfer** to the new owner. The Marina reserves the absolute **right to refuse** to enter into a contract with the new owner at its sole discretion.

## H. TERMINATION
H.2. **RIGHT OF RETENTION & CONSENT (MUVAFAKAT):** Until the Yacht Owner pays their outstanding financial debts, the Company may exercise its right of retention over the Yacht. The Marina will **NOT** issue the "No Debt Letter" (Borcu Yoktur Yazısı) required by the Harbor Master for vessel sale/transfer until all debts are settled.
H.3. In the event that the Contract expires and the Yacht Owner notifies the Company that they will not be renewing the Contract, the User is obliged to leave the Marina. Otherwise, the Yacht Owner shall pay an indemnity of 4 € (euro) per square metre of the area value of the Yacht for each following day.
`,
  'turkish_maritime_guide.md': `
# Maritime Guide for Turkish Waters

## 1. General Rules
*   **COLREGs:** Globally applicable rules regulating the right of way.
*   **Environmental Law:** Polluting the seas is strictly prohibited.

## 2. Mandatory Documents
1.  **Certificate of Registry / Tonnage Certificate**
2.  **Amateur Seaman's Certificate (ADB)**
3.  **Short Range Certificate (SRC)**
4.  **Mandatory Vessel Insurance**

## 5. Rules for Transiting the Turkish Straits
*   **Traffic Separation Scheme (TSS):** Small vessels must navigate outside the lanes designated for large ships.
*   **VHF Radio Watch:** Sector Channel must be monitored continuously.
`,
  'colregs_and_straits.md': `
# 📜 COLREGS & TURKISH STRAITS NAVIGATION RULES

## ⚓️ PART A: COLREGS (Critical Rules for Ada)

### Rule 5: Look-out (Gözcülük)
*   **Requirement:** Every vessel shall at all times maintain a proper look-out by sight and hearing as well as by all available means appropriate (Radar, AIS).

### Rule 6: Safe Speed (Emniyetli Hız)
*   **Requirement:** Every vessel shall at all times proceed at a safe speed.
*   **Ada Logic:** "In WIM Marina: 3 Knots. In Bosphorus: Max 10 Knots. Visibility < 0.5nm: Reduce speed immediately."

### Rule 7: Risk of Collision (Çatışma Riski)
*   **Requirement:** Proper use shall be made of radar equipment to obtain early warning of risk of collision.

### Rule 13: Overtaking (Yetişme)
*   **Rule:** Any vessel overtaking any other shall keep out of the way of the vessel being overtaken.

### Rule 15: Crossing Situation (Aykırı Geçiş)
*   **Rule:** When two power-driven vessels are crossing, the vessel which has the other **on her own starboard side** shall keep out of the way.

---

## 🌊 PART B: TURKISH STRAITS

### 1. TSVTS (Turkish Straits Vessel Traffic Service)
*   **Communication:** VHF Channel **11** (North), **12** (South/Marmara), **13** (Bosphorus Center), **14** (Safety).

### 2. Traffic Separation Scheme (TSS)
*   **Rule:** Navigation is strictly within the designated lanes.

### 3. Critical Constraints
*   **Max Speed:** 10 Knots over ground (SOG).
*   **Currents:** Surface currents can reach 4-6 knots (North to South). Undercurrents flow South to North.
`,
  'maritime_encyclopedia.md': `
# 📘 INTERNATIONAL MARITIME ENCYCLOPEDIA

**Scope:** Universal Maritime Knowledge, Signals, and Seamanship.

---

## 1. INTERNATIONAL CODE OF SIGNALS (ICS) - FLAGS

| Flag | Name | Meaning |
| :--- | :--- | :--- |
| ⬜️🟦 | **Alpha** | "I have a diver down; keep well clear at slow speed." |
| 🟥 | **Bravo** | "I am taking in, or discharging, or carrying dangerous goods." |
| 🟦⬜️🟥⬜️🟦 | **Charlie** | "Yes" (Affirmative). |
| 🟨🟦🟨 | **Delta** | "Keep clear of me; I am maneuvering with difficulty." |
| 🟥🟨 | **Oscar** | "Man overboard." |
| 🟨 | **Quebec** | "My vessel is 'healthy' and I request free pratique." (Pratika/Gümrük) |
| 🟦⬜️🟥 | **Whiskey** | "I require medical assistance." |

---

## 2. IALA BUOYAGE SYSTEM (REGION A - TURKEY/EUROPE)

### Lateral Marks (Channel Markers)
*   **Port Hand (İskele):** Red 🟥. Can Shape. Top Mark: Red Cylinder. **Rule:** "Red to Red when returning (entering harbor)."
*   **Starboard Hand (Sancak):** Green 🟩. Conical Shape. Top Mark: Green Cone. **Rule:** Keep Green to Starboard when entering harbor.

### Cardinal Marks (Compass Directions)
*   **North Cardinal:** Black over Yellow. ▲▲ (Two cones up). Pass to North.
*   **South Cardinal:** Yellow over Black. ▼▼ (Two cones down). Pass to South.
*   **East Cardinal:** Black-Yellow-Black. ⬥ (Egg shape). Pass to East.
*   **West Cardinal:** Yellow-Black-Yellow. ⧗ (Hourglass). Pass to West.

---

## 3. BEAUFORT WIND SCALE

| Force | Description | Speed (knots) | Sea State |
| :--- | :--- | :--- | :--- |
| **0-1** | Calm/Light Air | 0-3 | Mirror like / Ripples |
| **3** | Gentle Breeze | 7-10 | Large wavelets, crests break |
| **5** | Fresh Breeze | 17-21 | Moderate waves, many white horses |
| **8** | Gale | 34-40 | Moderately high waves, spindrift |
| **10** | Storm | 48-55 | Very high waves, white sea |
`,
  'route_istanbul_symi.md': `
# 🗺️ TACTICAL ROUTE GUIDE: ISTANBUL TO SYMI (GREECE)

**Mission:** Safe & Compliant Navigation from WIM (Istanbul) to Symi Island.
**Total Distance:** Approx. 380 NM.

---

## 🚩 PHASE 1: DEPARTURE & STRAITS (Turkish Waters)

### 1. Exit Formalities (Turkey)
Before leaving Turkish waters permanently for Greece, you must "Check-out".
*   **Recommended Port of Exit:** Datça or Bozburun (Closest to Symi).
*   **Procedure:** 1. Harbor Master (Liman) 2. Passport Police 3. Customs.

### 2. The Route South
*   **Marmara:** WIM -> Çanakkale Strait (Dardanelles). Alert: Monitor VTS Sector Nara on VHF Ch 12.
*   **Aegean:** Baba Kale -> Ayvalık -> Çeşme -> Didim -> Bodrum -> Datça.

---

## 🇬🇷 PHASE 2: CROSSING THE BORDER (Entering Greece)

### 1. The Line Protocol
*   **Hoist:** Yellow "Q" Flag (Quarantine) on Starboard spreader immediately upon crossing the maritime border.
*   **Hoist:** Greek Courtesy Flag above the Q flag.
*   **VHF:** Monitor Ch 12 (Port Police).

### 2. Symi Port of Entry (Gialos)
*   **Approach:** Enter the main bay (Gialos). Keep clear of ferries.
*   **Docking:** Proceed to the **North Quay** (near Clock Tower) for clearance.
*   **Formalities:** Present Passports, Boat Papers, Insurance, and Crew List. Pay TEPAI (e-Tax).

### 3. Symi Intel
*   **Dining:** Manos Fish Restaurant (Famous), Pantelis.
*   **Anchorage:** Pedi Bay (Quiet), Panormitis (South - Monastery).
`
};
