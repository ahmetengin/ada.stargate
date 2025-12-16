
// services/agents/federationAgent.ts

import { AgentAction, AgentTraceLog, NodeName, FederatedBerthAvailability } from '../../types';
import { TaskHandlerFn } from '../decomposition/types';
import { FEDERATION_REGISTRY } from '../config';
import { getCurrentMaritimeTime } from '../utils';

// Helper to create a log
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_fed_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const federationExpert = {
    
    // Skill: Get Berth Availability from a Partner Marina
    getRemoteBerthAvailability: async (marinaId: string, date: string, addTrace: (t: AgentTraceLog) => void): Promise<FederatedBerthAvailability | null> => {
        const targetId = marinaId.toLowerCase();
        addTrace(createLog('ada.federation', 'THINKING', `Federation Link Protocol initiated. Querying node: '${targetId}' for ${date}...`, 'EXPERT'));

        // 1. Identify Network Parent (WIM, D-Marin, or Setur) based on the marina ID requested
        // In a real app, this would be a sophisticated routing table. Here we use heuristics.
        
        let networkName = "UNKNOWN";
        if (targetId.includes('setur') || targetId.includes('kalamis') || targetId.includes('kas')) networkName = "SETUR";
        if (targetId.includes('d-marin') || targetId.includes('gocek') || targetId.includes('turgutreis')) networkName = "D-MARIN";
        if (targetId.includes('wim')) networkName = "WIM";

        addTrace(createLog('ada.federation', 'ROUTING', `Routing request via ${networkName} secure gateway...`, 'ORCHESTRATOR'));
        
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1200)); 

        // --- MOCK RESPONSES FOR FEDERATED PARTNERS ---
        let mockAvailability: FederatedBerthAvailability;

        // SETUR LOGIC
        if (targetId.includes('kalamis')) {
            mockAvailability = {
                marinaId: 'TR_KAL',
                date: date,
                totalBerths: 1291,
                availableBerths: 12, // Very busy
                occupancyRate: 99,
                message: `**Setur Kalamış & Fenerbahçe:** High occupancy alert. Only 12 berths available (mostly <15m). Recommendation: Reserve immediately via Setur App.`
            };
        } else if (targetId.includes('kas')) {
            mockAvailability = {
                marinaId: 'TR_KAS',
                date: date,
                totalBerths: 472,
                availableBerths: 45,
                occupancyRate: 90,
                message: `**Setur Kaş Marina:** Availability confirmed. 45 berths open. Perfect stopover for Kastellorizo (Meis) transit.`
            };
        } else if (targetId.includes('midilli') || targetId.includes('mytilene')) {
            mockAvailability = {
                marinaId: 'GR_MYT',
                date: date,
                totalBerths: 222,
                availableBerths: 50,
                occupancyRate: 77,
                message: `**Setur Mytilene (Lesvos):** Good availability. Please hoist Q-Flag upon entry to Greek waters.`
            };
        
        // D-MARIN LOGIC
        } else if (targetId.includes('gocek')) {
            mockAvailability = {
                marinaId: 'TR_GOC',
                date: date,
                totalBerths: 380,
                availableBerths: 8,
                occupancyRate: 98,
                message: `**D-Marin Göcek:** Extremely limited availability (High Season). 'Happy Berth Days' free days may be restricted.`
            };
        } else if (targetId.includes('turgutreis')) {
            mockAvailability = {
                marinaId: 'TR_TUR',
                date: date,
                totalBerths: 550,
                availableBerths: 35,
                occupancyRate: 93,
                message: `**D-Marin Turgutreis:** 35 berths available. Technical services fully operational.`
            };
        } else if (targetId.includes('dubai')) {
            mockAvailability = {
                marinaId: 'AE_DUB',
                date: date,
                totalBerths: 700,
                availableBerths: 150,
                occupancyRate: 78,
                message: `**D-Marin Dubai Harbour:** Wide availability for superyachts up to 160m.`
            };

        // DEFAULT FALLBACK
        } else {
            mockAvailability = {
                marinaId: marinaId,
                date: date,
                totalBerths: 500,
                availableBerths: Math.floor(Math.random() * 50),
                occupancyRate: 85,
                message: `Federated Partner '${marinaId}' reports limited availability for ${date}.`
            };
        }
        
        addTrace(createLog('ada.federation', 'OUTPUT', `Data Packet Received from ${networkName} Node.`, 'EXPERT'));
        return mockAvailability;
    }
};

// --- Handlers for the Brain (if used in MDAP graph) ---
export const federationHandlers: Record<string, TaskHandlerFn> = {
    'federation.getBerthAvailability': async (ctx: any, obs: any) => {
        const { marinaId, date } = obs.payload;
        const result = await federationExpert.getRemoteBerthAvailability(marinaId, date, () => {});
        return [{
            id: `act_fed_berth_${Date.now()}`,
            kind: 'internal',
            name: 'federation.berthAvailabilityResult',
            params: result
        }];
    }
};
