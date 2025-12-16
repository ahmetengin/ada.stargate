
import { MasterDataStructure } from '../types';

export const seturMasterData: MasterDataStructure = {
  identity: {
    name: "Setur Marinas",
    code: "SETUR_NETWORK",
    hq_location: "Istanbul, Turkey",
    network_size: "11 Marinas",
    vision: "Embracing the sea with passion and excellence.",
    contact: {
      global_support: "444 8 787",
      app_support: "info@seturmarinas.com"
    }
  },
  marina_portfolio: {
    TURKEY: [
      { id: "TR_KAL", name: "Setur Kalamış & Fenerbahçe", city: "Istanbul", capacity: 1291, vhf: "72", coordinates: { lat: 40.978, lng: 29.036 } },
      { id: "TR_YAL", name: "Setur Yalova", city: "Yalova", capacity: 240, vhf: "73", coordinates: { lat: 40.660, lng: 29.270 } },
      { id: "TR_AYV", name: "Setur Ayvalık", city: "Ayvalık", capacity: 450, vhf: "73", coordinates: { lat: 39.317, lng: 26.690 } },
      { id: "TR_CES", name: "Setur Çeşme", city: "Çeşme", capacity: 180, vhf: "72", coordinates: { lat: 38.322, lng: 26.304 } },
      { id: "TR_KAS", name: "Setur Kaş", city: "Kaş", capacity: 472, vhf: "73", coordinates: { lat: 36.200, lng: 29.630 } },
      { id: "TR_FIN", name: "Setur Finike", city: "Finike", capacity: 320, vhf: "73", coordinates: { lat: 36.294, lng: 30.148 } }
    ],
    GREECE: [
      { id: "GR_MYT", name: "Setur Mytilene (Midilli)", city: "Lesvos", capacity: 222, vhf: "71", coordinates: { lat: 39.102, lng: 26.555 } }
    ]
  },
  loyalty_program: {
    name: "Setur Zincir Kampanyası",
    tiers: {
      STANDARD: { benefits: ["Standart Bağlama"] },
      CHAIN_MEMBER: { benefits: ["%50 İndirimli Konaklama (Diğer Marinalarda)", "Ücretsiz Lift (Yıllık Sözleşmede)"] }
    },
    rules: "Sözleşmeli tekneler zincir dahilindeki diğer marinalarda günlük bağlamada %50 indirim kazanır."
  },
  digital_services: {
    mobile_app: {
      features: ["QR Giriş", "Online Ödeme", "Rezervasyon", "Atık Randevusu"]
    }
  },
  assets: {
    tenders: [
        { id: "SET-01", name: "Setur Palamar 1", callsign: "Setur 1", status: "Idle", type: "RIB" },
        { id: "SET-02", name: "Setur Palamar 2", callsign: "Setur 2", status: "Busy", type: "RIB" }
    ],
    charter_fleet: [] // Not managed directly
  }
};
