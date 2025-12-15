
// services/config.ts

import { TenantConfig } from "../types";
import { wimMasterData } from "./wimMasterData";
import { dmarinMasterData } from "./dmarinMasterData";

// The Federation Registry (D-Marin Global Network & WIM)
export const FEDERATION_REGISTRY: { peers: TenantConfig[] } = {
  peers: [
    {
      id: 'wim',
      name: 'West Istanbul Marina',
      fullName: 'ADA.MARINA.WIM',
      network: 'wim.ada.network',
      node_address: 'ada.marina.wim',
      status: 'ONLINE',
      api_endpoint: 'https://api.wim.com.tr/v1',
      region: 'MARMARA',
      tier: 'PRESTIGE_HUB',
      mission: 'To provide a clean, safe and agreeable living environment.',
      contextSources: ['docs/ada.marina/WIM_CONTRACT_REGULATIONS.md'],
      rules: {
        max_loa: 90.0,
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: 'Safety First. Zero Waste. Digital Excellence.',
      masterData: wimMasterData
    },
    {
      id: 'dmarin_global',
      name: 'D-Marin Global',
      fullName: 'ADA.MARINA.DMARIN_GLOBAL',
      network: 'global.d-marin.com',
      node_address: 'ada.orchestrator.global',
      status: 'ONLINE',
      api_endpoint: 'https://api.d-marin.com/v1',
      region: 'GLOBAL',
      tier: 'PRESTIGE_HUB',
      mission: "D-Marin global marina ağının operasyonel, ticari ve müşteri deneyimi süreçlerini yönetmek.",
      contextSources: ['docs/dmarin/DMARIN_OPERATIONAL_GUIDE.md', 'docs/dmarin/HAPPY_BERTH_DAYS.md'],
      rules: { 
        max_loa: 180.0,
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: "Customer First. Standardized Excellence. Connected Marina.",
      masterData: dmarinMasterData
    }
  ]
};

// Default Configuration: WIM
export const TENANT_CONFIG: TenantConfig = FEDERATION_REGISTRY.peers[0];
