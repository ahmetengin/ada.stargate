
import { MasterDataStructure } from '../types';

export const wimMasterData: MasterDataStructure = {
  identity: {
    name: "West Istanbul Marina",
    code: "WIM",
    alias: "Beylikdüzü Marina",
    operator: "Enelka Taahhüt İmalat ve Ticaret A.Ş.",
    awards: ["5 Gold Anchors", "Blue Flag (10 Years Continuous)", "Zero Waste Certificate (Gold)"],
    location: {
      district: "Beylikdüzü",
      neighborhood: "Yakuplu",
      city: "Istanbul",
      country: "Turkey",
      coordinates: {
        lat: 40.9628,
        lng: 28.6636
      },
      dedicated_locations: {
        fuel_station: {
          label: "Fuel Station (Lukoil)",
          coordinates: { lat: 40.9618, lng: 28.6645 }
        },
        customs_area: {
           label: "Customs & Passport Control",
           coordinates: { lat: 40.9635, lng: 28.6625 }
        },
        boatyard: {
            label: "Technical Hardstanding (60.000m2)",
            coordinates: { lat: 40.9640, lng: 28.6650 }
        }
      }
    },
    vision: "To provide a clean, safe and agreeable living and working environment for Yachts and Owners.",
    contact: {
      vhf_channels: {
        public: ["72", "16"],
        internal_ops: ["14"],
        vts_sectors: ["11", "12", "13"] 
      },
      call_sign: "West Istanbul Marina",
      phone: "+90 212 850 22 00"
    }
  },
  protocol_config: {
      welcome_hail: {
          channel: "72",
          template: "Good day, Captain. We have you on AIS approach at {distance} miles. Your berth {berth} is ready. {tender} has been dispatched to intercept and assist you at the breakwater.",
          trigger_distance_min: 5,
          trigger_distance_max: 7
      }
  },
  assets: {
    tenders: [
        { 
            id: "T-01", 
            name: "ada.sea.wimAlfa", 
            callsign: "WIM-A", 
            status: "Idle", 
            type: "RIB", 
            serviceCount: 124,
            // Capability: Mobile Bathymetry & Micro-Climate Sensing
            sensors: ["Depth (Chirp)", "Wind (Ultrasonic)", "SeaTemp"] 
        },
        { 
            id: "T-02", 
            name: "ada.sea.wimBravo", 
            callsign: "WIM-B", 
            status: "Busy", 
            assignment: "ARRIVAL_PILOT", 
            type: "RIB", 
            serviceCount: 88,
            sensors: ["Depth (Forward Scan)", "Camera (360)"]
        },
        { 
            id: "T-03", 
            name: "ada.sea.wimCharlie", 
            callsign: "WIM-C", 
            status: "Maintenance", 
            type: "Workboat", 
            serviceCount: 210,
            sensors: ["Fire Monitor", "Towing Load Cell"]
        }
    ],
    charter_fleet: [
        { id: "YCH-01", name: "WIM Explorer", type: "Motor Yacht", length: "18m", capacity: 10, status: "Available" },
        { id: "YCH-02", name: "WIM Breeze", type: "Sailing Yacht", length: "15m", capacity: 8, status: "Available" },
        { id: "YCH-03", name: "WIM Voyager", type: "Catamaran", length: "24m", capacity: 12, status: "Available" }
    ]
  },
  campus_stats: {
      total_area: "155,000 m²",
      sea_capacity: 600,
      land_capacity: 300
  },
  commercial_tenants: {
      count: 45,
      categories: ["Restaurants", "Boutiques", "Yacht Brokers", "Service Workshops", "Wellness"],
      lease_model: "Fixed Rent + % Turnover Share",
      common_area_charge_formula: "Total Cost / Total Leased Area * Tenant Area",
      key_tenants: [
          { name: "Calisto Balık", type: "F&B", location: "Kumsal Street" },
          { name: "Ella Italian", type: "F&B", location: "Kumsal Street" },
          { name: "Happy Moon's", type: "F&B", location: "Kumsal Street" },
          { name: "Poem Restaurant", type: "F&B", location: "Social Zone" },
          { name: "Fersah", type: "F&B", location: "Social Zone" },
          { name: "West Life Sports Club", type: "Wellness", location: "Block B" },
          { name: "Migros Jet", type: "Market", location: "Block A" },
          { name: "Yacht Brokerage Row", type: "Office", location: "Commercial Street" }
      ]
  },
  technical_facilities: {
      travel_lift_major: "700 Ton Travel Lift (Mega Yachts)",
      travel_lift_minor: "75 Ton Travel Lift",
      hardstanding_area: "60.000 m² (Capacity: 300 Yachts)",
      hangars: "11 Climate Controlled Hangars (up to 90m)",
      services: ["Hull Washing", "Antifouling", "Engine Overhaul", "Teak Repair", "Winterizing"]
  },
  hr_management: {
      staff_count: 120,
      departments: ["Global Ops", "Local Ops", "Technical", "Security", "Front Office", "Cleaning"],
      shift_pattern: "3 shifts (08-16, 16-24, 24-08)",
      patrol_protocol: "Security must scan QR codes at 15 checkpoints every 2 hours."
  },
  analytics_data: {
      historical_occupancy: { "2024_Q4": "88%", "2025_Q1": "75%", "2025_Q2": "92%" },
      prediction_model: "Seasonal ARIMA",
      what_if_scenarios_enabled: true
  },
  strategic_partners: {
    cross_border_partners: [
        { name: "Manos Fish Restaurant", location: "Symi, Greece", docking: "Symi Port (Courtesy Dock)" },
        { name: "Pantelis Restaurant", location: "Symi, Greece", docking: "Symi Port (Courtesy Dock)" }
    ]
  },
  legal_framework: {
    base_pricing: {
        mooring_daily: 4 // EUR per m²
    },
    pricing_multipliers: {
        tiers: {
            "STANDARD": 1.0,
            "PREMIUM": 1.2,
            "VIP": 1.5
        },
        seasonality: {
            "LOW": 0.8,
            "MID": 1.0,
            "HIGH": 1.3 // Summer / Peak season
        }
    }
  },
  event_calendar: [
      { id: 'EVT-01', name: 'Summer Gala Night', date: '2025-07-20', type: 'Social', location: 'Kumsal Beach' },
      { id: 'EVT-02', name: 'Regatta Start Line', date: '2025-08-10', type: 'Race', location: 'WIM Offshore' },
      { id: 'EVT-03', name: 'Marine Tech Expo', date: '2025-09-05', type: 'Conference', location: 'WIM Grand Ballroom' }
  ],
  concierge_services: {
    market_inventory: [
        { id: 'PROV-001', name: 'Fresh Milk (1L)', price: 2.50, unit: 'unit' },
        { id: 'PROV-002', name: 'Artisan Bread', price: 3.00, unit: 'loaf' },
        { id: 'PROV-003', name: 'Seasonal Fruits Basket', price: 15.00, unit: 'basket' },
        { id: 'PROV-004', name: 'Bottled Water (6x1.5L)', price: 5.00, unit: 'pack' },
        { id: 'PROV-005', name: 'Turkish Coffee', price: 7.50, unit: 'pack' }
    ],
    catering_menus: [
        { id: 'CAT-001', itemName: 'Salt Baked Sea Bass', description: 'Daily catch prepared in sea salt crust.', price: 85, restaurant: 'Calisto Balık', prepTime: 45 },
        { id: 'CAT-002', itemName: 'Truffle Mushroom Pizza', description: 'Stone oven, fresh truffle oil, mozzarella.', price: 28, restaurant: 'Ella Italian', prepTime: 25 },
        { id: 'CAT-003', itemName: 'Big Texas Burger', description: '200g Beef patty, cheddar, caramelized onions.', price: 22, restaurant: 'Happy Moon\'s', prepTime: 20 }
    ],
    housekeeping_services: [
        { type: 'Interior Cleaning', rate: 80, unit: 'hour' },
        { type: 'Exterior Wash', rate: 120, unit: 'vessel' },
        { type: 'Laundry Service', rate: 25, unit: 'load' }
    ]
  },
  facility_management: { 
    environmental_compliance: {
        zero_waste_certificate: "GOLD_TIER",
        blue_flag_status: "ACTIVE"
    }
  },
  services: {
    amenities: {
        restaurants: ["Calisto Balık", "Ella Italian", "Happy Moon's", "Poem Restaurant"]
    }
  }
};
