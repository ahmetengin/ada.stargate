
import { MasterDataStructure } from '../types';

export const dmarinMasterData: MasterDataStructure = {
  identity: {
    name: "D-Marin Global Network",
    code: "DMARIN_GLOBAL",
    hq_location: "Athens, Greece / Dubai, UAE",
    network_size: "26 Marinas in 9 Countries",
    vision: "Enriching the yachting experience through digital innovation and premium service.",
    contact: {
      global_support: "+30 210 988 0000",
      app_support: "digital@d-marin.com"
    }
  },
  marina_portfolio: {
    TURKEY: [
      { id: "TR_TUR", name: "D-Marin Turgutreis", city: "Bodrum", capacity: 550, vhf: "72", coordinates: { lat: 37.001, lng: 27.258 } },
      { id: "TR_DID", name: "D-Marin Didim", city: "Didim", capacity: 576, vhf: "72", coordinates: { lat: 37.348, lng: 27.266 } },
      { id: "TR_GOC", name: "D-Marin Göcek", city: "Göcek", capacity: 380, vhf: "73", coordinates: { lat: 36.755, lng: 28.936 } }
    ],
    GREECE: [
      { id: "GR_ZEA", name: "D-Marin Zea", city: "Athens", capacity: 670, vhf: "09", coordinates: { lat: 37.937, lng: 23.646 } },
      { id: "GR_GOU", name: "D-Marin Gouvia", city: "Corfu", capacity: 1235, vhf: "69", coordinates: { lat: 39.650, lng: 19.850 } },
      { id: "GR_LEF", name: "D-Marin Lefkas", city: "Lefkada", capacity: 620, vhf: "69", coordinates: { lat: 38.834, lng: 20.716 } }
    ],
    CROATIA: [
      { id: "HR_MAN", name: "D-Marin Mandalina", city: "Sibenik", capacity: 429, vhf: "17", coordinates: { lat: 43.723, lng: 15.898 } },
      { id: "HR_DAL", name: "D-Marin Dalmacija", city: "Bibinje", capacity: 1200, vhf: "17", coordinates: { lat: 44.056, lng: 15.293 } }
    ],
    UAE: [
      { id: "AE_DUB", name: "D-Marin Dubai Harbour", city: "Dubai", capacity: 700, vhf: "68", coordinates: { lat: 25.093, lng: 55.143 } }
    ],
    ITALY: [
      { id: "IT_VAR", name: "D-Marin Varazze", city: "Liguria", capacity: 800, vhf: "09", coordinates: { lat: 44.356, lng: 8.577 } }
    ]
  },
  loyalty_program: {
    name: "Happy Berth Days",
    tiers: {
      STANDARD: { benefits: ["Online Booking", "Digital Check-in"] },
      PREMIUM: { benefits: ["7 Days Free Berthing in Network", "40% Discount after free days"] },
      PLATINUM: { benefits: ["30 Days Free Berthing in Network", "Priority Berthing", "Free Pump-out"] }
    },
    rules: "Free days apply to any D-Marin marina other than the home port."
  },
  ocean_guardians: {
    initiative_name: "Project Poseidon",
    mission: "Turning every yacht into a research vessel.",
    active_missions: [
      { id: "M-01", name: "Aegean Temp Map", target: "Sea Surface Temperature", reward: "50 Miles" },
      { id: "M-02", name: "Monk Seal Watch", target: "Camera / Visual Spotting", reward: "Free Pump-out" },
      { id: "M-03", name: "Plastic Scan", target: "Microplastic Density (via Sensor)", reward: "Charity Donation" }
    ],
    partners: ["WWF", "National Geographic", "TURMEPA"]
  },
  digital_services: {
    smart_pedestal: {
      protocol: "MQTT/IoT",
      features: ["Remote Switching", "Consumption Monitoring", "Pre-paid Top-up", "AURA Light Control"],
      provider: "D-Marin Smart Pillar"
    },
    project_aura: {
      description: "Sentient Arrival Protocol using Lidar & Smart Lighting",
      sensors: ["Lidar Array", "Underwater LED DMX", "Pedestal Matrix Screen"],
      modes: ["LANDING_STRIP", "HEARTBEAT", "TEAM_COLORS", "EMERGENCY_FLASH"]
    },
    mobile_app: {
      features: ["Berth Booking", "Payment", "Service Request", "QR Access", "Citizen Science Dashboard", "Docking HUD"]
    }
  },
  commercial_tenants: {
    key_tenants: [
      { name: "Nusr-Et", type: "F&B", location: "Dubai Harbour / Turgutreis" },
      { name: "Zuma", type: "F&B", location: "Turgutreis" },
      { name: "Novikov", type: "F&B", location: "Porto Montenegro (Partner)" }
    ]
  },
  technical_facilities: {
    travel_lift_major: "Various (up to 1000T in Dubai)",
    services: ["Paint", "Engine", "Rigging", "Diver"]
  },
  hr_management: {
    staff_count: 1500,
    departments: ["Global Ops", "Local Ops", "Concierge", "HSE"]
  },
  analytics_data: {
    prediction_model: "Global Traffic Flow (TabPFN)",
    cross_border_trends: "High traffic TR->GR in July/Aug"
  },
  services: {
    amenities: {
      restaurants: ["Nusr-Et", "Zuma", "Novikov", "Local Tavernas"]
    }
  },
  assets: {
    tenders: [
      { id: "T-01", name: "D-Marin Tender 1", callsign: "D-Marin 1", status: "Idle", type: "RIB", serviceCount: 12 },
      { id: "T-02", name: "D-Marin Tender 2", callsign: "D-Marin 2", status: "Busy", assignment: "VIP Transfer", type: "Workboat", serviceCount: 45 }
    ],
    charter_fleet: []
  }
};
