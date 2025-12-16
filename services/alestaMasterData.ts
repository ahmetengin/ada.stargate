
import { MasterDataStructure } from '../types';

export const alestaMasterData: MasterDataStructure = {
  identity: {
    name: "Alesta Yacht Hotel & Marina",
    code: "ALESTA_FETHIYE",
    hq_location: "Fethiye, Turkey",
    network_size: "Boutique (50 Berths)",
    vision: "Exclusive hospitality where the sea meets luxury dining.",
    contact: {
      phone: "+90 252 612 00 00",
      email: "info@alestayacht.com",
      vhf_channels: {
        public: ["73"], // Different from WIM (72)
        internal_ops: ["16"]
      }
    }
  },
  assets: {
    tenders: [
        { id: "ALE-01", name: "Alesta Service", callsign: "Alesta", status: "Idle", type: "RIB" }
    ],
    charter_fleet: []
  },
  marina_portfolio: {
    TURKEY: [
      { id: "TR_FET", name: "Alesta Marina", city: "Fethiye", capacity: 50, vhf: "73", coordinates: { lat: 36.623, lng: 29.112 } }
    ]
  },
  loyalty_program: {
    name: "Alesta Club",
    tiers: {
      GUEST: { benefits: ["Spa Access"] },
      VIP: { benefits: ["%20 Restaurant Discount", "Free Spa", "Priority Berthing"] }
    },
    rules: "Restaurant spend accumulates points for mooring discounts."
  },
  digital_services: {
    mobile_app: {
      features: ["Room Service to Boat", "Spa Booking", "A la Carte Order"]
    }
  },
  services: {
      amenities: {
          restaurants: ["Alesta Restaurant", "Casa Margot"]
      }
  },
  legal_framework: {
      base_pricing: {
          mooring_daily: 3.5 // Different pricing model
      },
      pricing_multipliers: {
        tiers: { "STANDARD": 1.0 },
        seasonality: { "HIGH": 1.5, "LOW": 0.8 }
      }
  }
};
