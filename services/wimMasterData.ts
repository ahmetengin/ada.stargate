
// services/wimMasterData.ts
import { MasterDataStructure } from '../types';

export const wimMasterData: MasterDataStructure = {
  "identity": {
    "name": "West Istanbul Marina",
    "code": "WIM",
    "alias": "Beylikdüzü Marina",
    "operator": "Enelka Taahhüt İmalat ve Ticaret A.Ş.",
    "awards": ["5 Gold Anchors", "Blue Flag (10 Years Continuous)", "Zero Waste Certificate (Gold)"],
    "location": {
      "district": "Beylikdüzü",
      "neighborhood": "Yakuplu",
      "city": "Istanbul",
      "country": "Turkey",
      "coordinates": {
        "lat": 40.9628,
        "lng": 28.6636
      },
      "dedicated_locations": {
        "fuel_station": {
          "label": "Fuel Station (Lukoil)",
          "coordinates": { "lat": 40.9618, "lng": 28.6645 }
        },
        "customs_area": {
           "label": "Customs & Passport Control",
           "coordinates": { "lat": 40.9635, "lng": 28.6625 }
        },
        "boatyard": {
            "label": "Technical Hardstanding (60.000m2)",
            "coordinates": { "lat": 40.9640, "lng": 28.6650 }
        }
      },
      "pontoons": [
          { "label": "Pontoon A", "relative_position": { "lng_offset": -0.002, "lat_offset": 0.001, "width_scale": 0.5, "length_scale": 4 } },
          { "label": "Pontoon B", "relative_position": { "lng_offset": -0.001, "lat_offset": 0.001, "width_scale": 0.5, "length_scale": 5 } },
          { "label": "Pontoon C", "relative_position": { "lng_offset": 0, "lat_offset": 0.001, "width_scale": 0.5, "length_scale": 5 } },
          { "label": "Pontoon D", "relative_position": { "lng_offset": 0.001, "lat_offset": 0.001, "width_scale": 0.5, "length_scale": 5 } },
          { "label": "VIP Quay", "relative_position": { "lng_offset": 0.002, "lat_offset": 0, "width_scale": 0.8, "length_scale": 6 } }
      ]
    },
    "vision": "To provide a clean, safe and agreeable living and working environment for Yachts and Owners.",
    "contact": {
      "vhf_channels": {
        "public": ["72", "16"],
        "internal_ops": ["14"],
        "vts_sectors": ["11", "12", "13"] 
      },
      "call_sign": "West Istanbul Marina",
      "phone": "+90 212 850 22 00"
    }
  },
  "campus_stats": {
      "total_area": "155,000 m²",
      "sea_capacity": 600,
      "land_capacity": 300
  },
  "commercial_tenants": {
      "count": 45,
      "categories": ["Restaurants", "Boutiques", "Yacht Brokers", "Service Workshops", "Wellness"],
      "lease_model": "Fixed Rent + % Turnover Share",
      "common_area_charge_formula": "Total Cost / Total Leased Area * Tenant Area",
      "key_tenants": [
          { "name": "Poem Restaurant", "type": "F&B", "location": "Social Zone" },
          { "name": "Fersah", "type": "F&B", "location": "Social Zone" },
          { "name": "Calisto", "type": "F&B", "location": "Social Zone" },
          { "name": "Happy Moon's", "type": "F&B", "location": "Social Zone" },
          { "name": "Big Chefs", "type": "F&B", "location": "Social Zone" },
          { "name": "West Life Sports Club", "type": "Wellness", "location": "Block B" },
          { "name": "Migros Jet", "type": "Market", "location": "Block A" },
          { "name": "Yacht Brokerage Row", "type": "Office", "location": "Commercial Street" }
      ]
  },
  "technical_facilities": {
      "travel_lift_major": "700 Ton Travel Lift (Mega Yachts)",
      "travel_lift_minor": "75 Ton Travel Lift",
      "hardstanding_area": "60.000 m² (Capacity: 300 Yachts)",
      "hangars": "11 Climate Controlled Hangars (up to 90m)",
      "services": ["Hull Washing", "Antifouling", "Engine Overhaul", "Teak Repair", "Winterizing"]
  },
  "hr_management": {
      "staff_count": 120,
      "departments": ["Operations", "Technical", "Security", "Front Office", "Cleaning"],
      "shift_pattern": "3 shifts (08-16, 16-24, 24-08)",
      "patrol_protocol": "Security must scan QR codes at 15 checkpoints every 2 hours."
  },
  "analytics_data": {
      "historical_occupancy": { "2024_Q4": "88%", "2025_Q1": "75%", "2025_Q2": "92%" },
      "prediction_model": "Seasonal ARIMA",
      "what_if_scenarios_enabled": true
  },
  "facility_management": {
      "infrastructure": {
          "pedestals": { "count": 350, "type": "Smart Metered", "maintenance_cycle": "Monthly" },
          "fire_safety": { "hydrants": 45, "extinguishers": 120, "last_audit": "2025-10-01" },
          "fuel_tanks": { "diesel_capacity": 50000, "petrol_capacity": 10000, "sensor_type": "IoT Level" }
      },
      "environmental_compliance": {
          "zero_waste_certificate": "GOLD LEVEL",
          "blue_flag": {
              "status": "ACTIVE",
              "season": "2025",
              "sea_water_limits": {
                  "e_coli": "< 250 cfu/100ml",
                  "enterococci": "< 100 cfu/100ml"
              },
              "sampling_frequency": "15 Days (Ministry of Health)"
          },
          "waste_categories": [
              { "code": "BLUE", "type": "Paper/Cardboard" },
              { "code": "YELLOW", "type": "Plastic" },
              { "code": "GREEN", "type": "Glass" },
              { "code": "GREY", "type": "Metal" },
              { "code": "BLACK", "type": "Non-Recyclable / Domestic" },
              { "code": "ORANGE", "type": "Hazardous / Waste Oil / Batteries" }
          ],
          "reporting_authority": "Ministry of Environment & Urbanization (ECBS)",
          "tracking_system": "MoTAT (Mobile Hazardous Waste Tracking System)"
      },
      "hse_protocols": {
          "occupational_safety": "ISO 45001 Certified",
          "ppe_requirements": "Mandatory in Boatyard (Helmet, Vest, Shoes)",
          "emergency_response": "Drills conducted quarterly"
      }
  },
  "event_calendar": [
      { "id": "EVT-01", "name": "TAYK - Fahir Çelikbaş Cup", "date": "2025-05-15", "type": "Race", "organizer": "TAYK & WIM" },
      { "id": "EVT-02", "name": "WIM Hello Summer Party", "date": "2025-06-01", "type": "Social", "location": "Yacht Club Terrace" },
      { "id": "EVT-03", "name": "BoatFest 2025", "date": "2025-09-20", "type": "Fair", "location": "Main Breakwater" }
  ],
  "security_policy": {
    "authority": "ada.passkit (IAM Node)",
    "data_sovereignty": {
        "ada_sea": "Autonomous Node (Captain Owned). Internal telemetry (fuel, battery, interior) is PRIVATE. Cannot be queried by Marina.",
        "ada_marina": "Infrastructure Node. Shore power, water meter, CCTV (Public Areas), and Mooring data is VISIBLE.",
        "kvkk_status": "Strict Enforcement. Personal data is masked at rest and in transit."
    },
    "data_classification": {
      "PUBLIC (Level 0)": ["Vessel Name", "Hail Port", "ETA (Approx)", "VHF Channel", "AIS Position"],
      "PRIVATE (Level 1 - Captain Only)": ["Exact Location (Pontoon)", "Crew List", "Battery Status", "Fuel Level", "Provisions"],
      "RESTRICTED (Level 5 - GM)": ["Financial Debt", "Legal Disputes", "Full Telemetry History", "Security Logs"]
    },
    "vehicle_policy": {
        "dynamic_pool": "Members may register multiple vehicles. Only 1 active vehicle permitted inside per contract."
    },
    "protocols": {
      "kvkk_compliance": "Strictly enforce Article 20. No personal data on public channels (Ch 72).",
      "gdpr_compliance": "Right to be forgotten active. Data encryption required for Level 1+."
    }
  },
  "weather_station": {
      "node": "ada.weather.wim",
      "sources": [
          { "name": "Poseidon System", "region": "Aegean/Marmara", "priority": 1 },
          { "name": "Windy.com (ECMWF)", "type": "Global Model", "priority": 2 },
          { "name": "OpenWeatherMap", "type": "API", "priority": 3 }
      ],
      "alert_thresholds": {
          "small_craft_advisory": "Wind > 22 knots",
          "gale_warning": "Wind > 34 knots",
          "storm_warning": "Wind > 48 knots",
          "thunderstorm": "Lightning probability > 40%"
      },
      "reporting_protocol": {
          "frequency": "Daily 08:00 & 18:00 + On Demand",
          "format": "3-Day Outlook (Morning/Afternoon/Night)",
          "proactive_alert": "Broadcast immediately if thresholds exceeded."
      }
  },
  "assets": {
    "tenders": [
      { "id": "T-01", "name": "ada.sea.wimAlfa", "status": "Idle", "type": "Pilot/Tender" },
      { "id": "T-02", "name": "ada.sea.wimBravo", "status": "Idle", "type": "Pilot/Tender" },
      { "id": "T-03", "name": "ada.sea.wimCharlie", "status": "Maintenance", "type": "Technical/Rescue" }
    ],
    "charter_fleet": [
        { "id": "CH-01", "name": "M/Y WIM Prestige", "type": "Motor Yacht", "length": "24m", "capacity": 10, "status": "Available", "operator": "WIM", "sales_agent": "Kites" },
        { "id": "CH-02", "name": "S/Y Wind Chaser", "type": "Sailing Yacht", "length": "16m", "capacity": 6, "status": "Booked", "operator": "WIM", "sales_agent": "Kites" },
        { "id": "CH-03", "name": "VIP Transfer Boat", "type": "Speedboat", "length": "10m", "capacity": 4, "status": "Available", "operator": "WIM", "sales_agent": "Kites" }
    ],
    "capacities": {
        "total_area": "155.000 m2",
        "sea_berths": 600,
        "land_park": 300,
        "rack_park": "96 (up to 7m)",
        "hangars": "11 (up to 90m)",
        "hardstanding": "60.000 m2"
    },
    "berth_map": {
        "A": { "type": "Concrete", "tier": "PREMIUM", "max_loa": 25, "depth": 5.5, "capacity": 40, "status": "90%", "amenities": ["Fiber", "63A", "Pump-out"] },
        "B": { "type": "Concrete", "tier": "STANDARD", "max_loa": 20, "depth": 4.5, "capacity": 50, "status": "85%", "amenities": ["Fiber", "32A"] },
        "C": { "type": "Concrete", "tier": "STANDARD", "max_loa": 15, "depth": 4.0, "capacity": 60, "status": "FULL", "amenities": ["16A"] },
        "VIP": { "type": "Quay", "tier": "VIP", "max_loa": 90, "depth": 8.0, "capacity": 10, "status": "AVAILABLE", "amenities": ["Restricted Access", "125A", "Private Parking"] },
        "T": { "type": "T-Head", "tier": "PREMIUM", "max_loa": 40, "depth": 6.0, "capacity": 8, "status": "AVAILABLE", "amenities": ["Easy Maneuver", "63A"] }
    }
  },
  "legal_framework": {
    "governing_law": "Republic of Türkiye",
    "jurisdiction": "Istanbul Central Courts & Enforcement Offices (Article K.1)",
    "currency": "EUR",
    "payment_terms": "Advance Payment",
    "contract_types": ["Mooring", "Lifting", "Launching", "Dry Berthing"],
    "base_pricing": {
        "mooring_daily": 1.5, // EUR per m2 (Base Rate)
        "electricity": 0.35, // EUR per kW
        "water": 3.50 // EUR per m3
    },
    "pricing_multipliers": {
        "tiers": {
            "VIP": 2.5,      // 150% markup for VIP Quay
            "PREMIUM": 1.25, // 25% markup for T-Heads/Sea View
            "STANDARD": 1.0, // Base rate
            "ECONOMY": 0.85  // 15% discount for inner berths
        },
        "seasonality": {
            "HIGH": 1.2, // Summer
            "LOW": 0.8   // Winter
        }
    },
    "cross_border_protocols": {
        "greece": {
            "entry_ports": ["Chios", "Lesvos", "Samos", "Kos", "Rhodes", "Simi"],
            "requirements": ["Schengen Visa", "DEKPA (Transit Log)", "TEPAI (Tax)"],
            "flag_etiquette": "Greek courtesy flag on Starboard spreader."
        }
    }
  },
  "traffic_control": {
      "system_type": "ATC-Style Sequencing (Tower Control)",
      "holding_area": {
          "name": "Sector Zulu",
          "location": "1nm South of Breakwater",
          "rules": "Maintain 3 cables separation. Anchor ready."
      },
      "ambarli_integration": {
          "name": "Ambarlı Port Authority",
          "type": "Commercial Port",
          "traffic_types": ["Container Ship", "Tanker", "Ro-Ro"],
          "rules": "Pleasure craft must yield to commercial traffic > 50m.",
          "monitor_channel": "12"
      },
      "priority_hierarchy": [
          "LEVEL 1: Emergency (Mayday/Pan Pan) / State Vessels",
          "LEVEL 2: Medical Emergency / Fuel Critical",
          "LEVEL 3: Commercial Passenger Traffic (Scheduled Ferries)",
          "LEVEL 4: VIP / Superyachts (>40m) / High Value Assets",
          "LEVEL 5: Standard Pleasure Craft (Motor)",
          "LEVEL 6: Tenders / Jet Skis"
      ],
      "separation_rules": {
          "standard": "3 minutes separation at entrance",
          "heavy_traffic": "Hold outbound traffic for inbound heavy vessels",
          "conflict_resolution": "Lower priority vessel holds at Sector Zulu."
      },
      "emergency_broadcast_protocols": {
          "code_red": {
              "condition": "Fire / Collision / Explosion",
              "broadcast_tr": "EMERGENCY. ALL STATIONS. PORT IS CLOSED. HOLD YOUR PRESENT POSITION.",
              "broadcast_en": "EMERGENCY. ALL STATIONS. PORT IS CLOSED. HOLD YOUR PRESENT POSITION.",
              "action": "Block all traffic. Dispatch Fire Tenders."
          }
      }
  },
  "services": {
    "technical": {
      "travel_lift_major": "700 Ton Travel Lift (Mega Yachts)",
      "travel_lift_minor": "75 Ton Travel Lift",
      "haul_out": "Available (60.000m2 Hardstanding)",
      "pressure_wash": "Available",
      "bilgin_yachts": "Shipyard On-site"
    },
    "insurance_partners": [
        { "name": "Turk P&I", "type": "Local / Liability", "rating": "A+" },
        { "name": "Pantaenius", "type": "International / Hull", "rating": "AAA" },
        { "name": "Allianz Marine", "type": "General", "rating": "AA" }
    ],
    "amenities": {
      "restaurants": [
        "Poem Restaurant", "Fersah", "Big Chefs", "Happy Moon's", "Calisto",
        "West Life", "The Roof", "Kumsal Beach"
      ],
      "lifestyle": [
        "Kumsal Istanbul Street", "Kumsal Beach", "Yacht Club", 
        "Mask Beach", "Paris Saint-Germain Academy Beylikdüzü"
      ],
      "sports": [
        "West Life Sports Club", "Fitness", "Sauna", "Indoor/Outdoor Pools", 
        "WEST Istanbul Marina Tennis Sports Club", "Basketball", "Football", "Sailing School (TYF/RYA)"
      ],
      "shopping": "Shopping Center & Market, BoatFest For-Sale Boat Pontoon",
      "electricity": "Metered (16A-63A) + Fiber Internet",
      "water": "Metered",
      "fuel": "Station Available (Duty-free subject to conditions)",
      "security": "24/7 Private Security + Helipad + Customs Gate",
      "parking": "ISPARK (Integrated) - 550 Car Capacity",
      "atm": "Garanti BBVA ATM"
    }
  },
  "penalties": {
    "late_departure": "4 EUR per m2 per day (Article H.3)",
    "pollution": "2x cost of cleaning + Municipal Fine (Article F.13)",
    "contract_breach": "Immediate Termination without refund"
  }
};
