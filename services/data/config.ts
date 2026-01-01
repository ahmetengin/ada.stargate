
// services/data/config.ts
import { TenantConfig } from "../../types";
import { wimMasterData } from "./wimMasterData";

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
    }
  ]
};

export const TENANT_CONFIG: TenantConfig = FEDERATION_REGISTRY.peers[0];
