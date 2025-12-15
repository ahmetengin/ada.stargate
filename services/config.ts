
// services/config.ts

import { TenantConfig } from "../types";
import { dmarinMasterData } from "./dmarinMasterData";

// The Federation Registry (D-Marin Global Network)
export const FEDERATION_REGISTRY: { peers: TenantConfig[] } = {
  peers: [
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
      mission: `D-Marin global marina ağının operasyonel, ticari ve müşteri deneyimi süreçlerini yönetmek.`,
      contextSources: ['docs/dmarin/DMARIN_OPERATIONAL_GUIDE.md', 'docs/dmarin/HAPPY_BERTH_DAYS.md'],
      rules: { 
        max_loa: 180.0,
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: `Customer First. Standardized Excellence. Connected Marina.`,
      masterData: dmarinMasterData, 
    }
  ]
};

// Default Configuration
export const TENANT_CONFIG: TenantConfig = FEDERATION_REGISTRY.peers[0];
