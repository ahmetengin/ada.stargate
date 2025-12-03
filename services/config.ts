
// services/config.ts

import { TenantConfig } from "../types";
import { wimMasterData } from "./wimMasterData";

// The Federation Registry (Global Maritime Network)
export const FEDERATION_REGISTRY: { peers: TenantConfig[] } = {
  peers: [
    {
      id: 'wim',
      name: 'West Istanbul Marina',
      fullName: 'ADA.MARINA.WIM',
      network: 'wim.ada.network',
      node_address: 'ada.marina.wim',
      status: 'ONLINE',
      api_endpoint: 'https://api.wim.network',
      region: 'TR_MARMARA',
      tier: 'PRESTIGE_HUB',
      mission: `West İstanbul Marina operasyonlarını yönetmek.`,
      contextSources: ['docs/tactical/Ada.marina.WIM-Tactical-Spec.md'],
      rules: { 
        max_loa: 90.0,
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: `This service represents the tenant: West Istanbul Marina (WIM). It operates under the Tactical Agentic Coding (TAC) doctrine.`,
      masterData: wimMasterData, // Full wimMasterData injected here
    },
    {
      id: 'dmaris_gocek',
      name: 'D-Marin Göcek',
      fullName: 'ADA.MARINA.DMARISGOCEK',
      network: 'dmarin.ada.network',
      node_address: 'ada.marina.dmarisgocek',
      status: 'ONLINE', 
      api_endpoint: 'https://api.dmarina.com/gocek',
      region: 'TR_AEGEAN',
      mission: 'D-Marin Göcek operasyonlarını Ada ekosistemi üzerinden yönetmek.',
      contextSources: [],
      rules: { max_loa: 70.0, speed_limit_knots: 3 },
      doctrine: 'D-Marin Group protocols.',
      masterData: { 
          identity: {
              location: {
                  coordinates: { lat: 36.756, lng: 28.935 } // Göcek Coordinates
              }
          },
          services: { amenities: { restaurants: ["Q Lounge", "Breeze"] } } 
      },
    },
    {
      id: 'setur_kalamis',
      name: 'Setur Kalamış',
      fullName: 'ADA.MARINA.SETURKALAMIS',
      network: 'setur.ada.network',
      node_address: 'ada.marina.seturkalamis',
      status: 'ONLINE',
      api_endpoint: 'https://api.seturmarinas.com/kalamis',
      region: 'TR_MARMARA',
      mission: 'Setur Kalamış operasyonlarını yönetmek.',
      contextSources: [],
      rules: { max_loa: 60.0 },
      doctrine: 'Setur Marinas protocols.',
      masterData: {
          identity: {
              location: {
                  coordinates: { lat: 40.978, lng: 29.036 } // Kalamış Coordinates
              }
          }
      },
    },
    {
      id: 'phisedelia',
      name: 'S/Y Phisedelia',
      fullName: 'ADA.SEA.PHISEDELIA',
      network: 'ada.sea.network',
      node_address: 'ada.sea.phisedelia',
      region: 'OPEN_SEA',
      status: 'ONLINE',
      api_endpoint: 'https://api.ada.sea/phisedelia', 
      mission: `Otonom yarış teknesi S/Y Phisedelia'nın açık deniz yarışlarında optimum performans ve güvenlik ile ilerlemesini sağlamak.`,
      contextSources: ['docs/tactical/Ada.sea.Phisedelia-Tactical-Spec.md'],
      rules: { 
        max_speed_knots: 30.0,
        colregs_safe_distance_nm: 0.5,
      },
      doctrine: `This service represents the tenant: S/Y Phisedelia (Autonomous Racing Yacht).`,
      masterData: { 
        vessel_id: 'PHI-V065',
        type: 'VO65 Racing Yacht',
        flag: 'MT',
        loa: 20.4,
        identity: {
            location: {
                coordinates: { lat: 40.9634, lng: 28.6289 } // Starts at WIM
            }
        }
      },
    }
  ]
};

// Default Configuration (Fallback)
export const TENANT_CONFIG: TenantConfig = FEDERATION_REGISTRY.peers[0];
