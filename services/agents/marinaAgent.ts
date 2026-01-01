
import { AgentTraceLog, VesselIntelligenceProfile, NodeName, VesselSystemsStatus, AisTarget, TenantConfig, AgentAction } from '../../types';
import { haversineDistance, getCurrentMaritimeTime } from '../utils/utils';
import { persistenceService, STORAGE_KEYS } from '../utils/persistence'; 
import { invokeAgentSkill } from '../api'; 
import { wimMasterData } from '../data/wimMasterData';
import { TaskHandlerFn } from '../decomposition/types';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

const DEFAULT_FLEET: VesselIntelligenceProfile[] = [
    { 
        name: 'S/Y Phisedelia', imo: '987654321', type: 'VO65 Racing Yacht', flag: 'MT', 
        ownerName: 'Ahmet Engin', ownerId: '12345678901', ownerEmail: 'ahmet.engin@example.com', ownerPhone: '+905321234567',
        dwt: 150, loa: 20.4, beam: 5.6, status: 'INBOUND', location: 'Sea of Marmara', 
        relationship: 'CONTRACT_HOLDER',
        coordinates: { lat: 40.8500, lng: 28.5000 },
        voyage: { lastPort: 'Alicante', nextPort: 'WIM', eta: '1 Hour' },
        paymentHistoryStatus: 'REGULAR',
        adaSeaOneStatus: 'ACTIVE', 
        utilities: { electricityKwh: 450.2, waterM3: 12.5, lastReading: 'Today 08:00', status: 'ACTIVE' }
    }
];

let FLEET_DB: VesselIntelligenceProfile[] = persistenceService.load(STORAGE_KEYS.FLEET, DEFAULT_FLEET);

export const marinaHandlers: Record<string, TaskHandlerFn> = {
    'marina.identifyVessel': async (ctx, obs) => {
        return [{
            id: `act_mar_id_${Date.now()}`,
            kind: 'internal',
            name: 'marina.vesselIdentified',
            params: { vessel: 'S/Y Phisedelia', priority: 'HIGH' }
        }];
    },
    'marina.dispatchTender': async (ctx, obs) => {
        return [{
            id: `act_mar_disp_${Date.now()}`,
            kind: 'external',
            name: 'marina.tenderDispatched',
            params: { tender: 'Tender Alpha', target: 'Breakwater' }
        }];
    }
};

export const marinaExpert = {
    getAllFleetVessels: (): VesselIntelligenceProfile[] => FLEET_DB,
    
    getVesselTelemetry: async (vesselName: string): Promise<VesselSystemsStatus | null> => {
        try {
            const remoteData = await invokeAgentSkill('marina', 'get_telemetry', { vessel_name: vesselName });
            if (remoteData?.battery) return remoteData as VesselSystemsStatus;
        } catch (e) {}

        return {
            battery: { serviceBank: 25.4, engineBank: 26.1, status: 'DISCHARGING' },
            tanks: { fuel: 45, freshWater: 80, blackWater: 15 },
            shorePower: { connected: true, voltage: 228, amperage: 12.5 }
        };
    },

    checkCharterFleetAvailability: async (type: string, date: string, addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        addTrace(createLog('ada.marina', 'THINKING', `Checking charter fleet for ${type} on ${date}...`, 'EXPERT'));
        const fleet = wimMasterData.assets?.charter_fleet || [];
        return fleet.filter((boat: any) => boat.status === 'Available');
    }
};
