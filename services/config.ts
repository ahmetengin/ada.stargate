
// services/config.ts

import { TenantConfig } from "../types";
import { wimMasterData } from "./wimMasterData";
import { dmarinMasterData } from "./dmarinMasterData";
import { seturMasterData } from "./seturMasterData";
import { alestaMasterData } from "./alestaMasterData";

// The Federation Registry (Global Network)
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
      fullName: 'ADA.MARINA.DMARIN',
      network: 'global.d-marin.com',
      node_address: 'ada.orchestrator.dmarin',
      status: 'ONLINE',
      api_endpoint: 'https://api.d-marin.com/v1',
      region: 'GLOBAL',
      tier: 'NETWORK_HQ',
      mission: "D-Marin global marina ağının operasyonel, ticari ve müşteri deneyimi süreçlerini yönetmek.",
      contextSources: ['docs/dmarin/DMARIN_OPERATIONAL_GUIDE.md', 'docs/dmarin/HAPPY_BERTH_DAYS.md'],
      rules: { 
        max_loa: 180.0,
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: "Customer First. Standardized Excellence. Connected Marina.",
      masterData: dmarinMasterData
    },
    {
      id: 'setur_marinas',
      name: 'Setur Marinas',
      fullName: 'ADA.MARINA.SETUR',
      network: 'setur.ada.network',
      node_address: 'ada.orchestrator.setur',
      status: 'ONLINE',
      api_endpoint: 'https://api.seturmarinas.com/v2',
      region: 'AEGEAN_MED',
      tier: 'NETWORK_HQ',
      mission: "Setur Marinas zincir operasyonlarını ve müşteri sadakat programını yönetmek.",
      contextSources: [],
      rules: {
        max_loa: 60.0,
        speed_limit_knots: 3,
        currency: "TRY"
      },
      doctrine: "Passionate about Sea. Chain Benefits.",
      masterData: seturMasterData
    },
    {
      id: 'alesta_fethiye',
      name: 'Alesta Yacht Hotel',
      fullName: 'ADA.MARINA.ALESTA',
      network: 'alesta.ada.network',
      node_address: 'ada.marina.alesta',
      status: 'ONLINE',
      api_endpoint: 'https://api.alesta.com/v1',
      region: 'AEGEAN_SOUTH',
      tier: 'BOUTIQUE',
      mission: "Butik otel konforunu marina hizmetiyle birleştirmek.",
      contextSources: [],
      rules: {
        max_loa: 30.0, // Smaller capacity
        speed_limit_knots: 3,
        currency: "EUR"
      },
      doctrine: "Luxury Hospitality. Cuisine & Comfort.",
      masterData: alestaMasterData
    }
  ]
};

// Default Configuration: WIM
export const TENANT_CONFIG: TenantConfig = FEDERATION_REGISTRY.peers[0];
