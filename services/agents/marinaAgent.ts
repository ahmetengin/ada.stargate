
import { TaskHandlerFn } from '../decomposition/types';
import { AgentAction, AgentTraceLog, VesselIntelligenceProfile, NodeName, Tender, VesselSystemsStatus, AisTarget, TenantConfig } from '../../types';
import { haversineDistance, getCurrentMaritimeTime } from '../utils';
import { persistenceService, STORAGE_KEYS } from '../persistence'; 
import { checkBackendHealth, invokeAgentSkill } from '../api'; // Import API helpers
import { facilityExpert } from './facilityAgent'; 
import { wimMasterData } from '../wimMasterData';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

// --- DEFAULT FLEET DATA ---
const DEFAULT_FLEET: VesselIntelligenceProfile[] = [
    { 
        name: 'S/Y Phisedelia', imo: '987654321', type: 'VO65 Racing Yacht (ex-Mapfre)', flag: 'MT', 
        ownerName: 'Ahmet Engin', ownerId: '12345678901', ownerEmail: 'ahmet.engin@example.com', ownerPhone: '+905321234567',
        // dwt is optional in VesselIntelligenceProfile
        dwt: 150, loa: 20.4, beam: 5.6, status: 'INBOUND', location: 'Sea of Marmara', 
        relationship: 'CONTRACT_HOLDER', // GOLD MEMBER
        coordinates: { lat: 40.8500, lng: 28.5000 }, // Approx 10nm out
        voyage: { lastPort: 'Alicante', nextPort: 'WIM', eta: '1 Hour' },
        paymentHistoryStatus: 'REGULAR',
        adaSeaOneStatus: 'ACTIVE', 
        utilities: { electricityKwh: 450.2, waterM3: 12.5, lastReading: 'Today 08:00', status: 'ACTIVE' }
    },
    // ... (rest of mock fleet)
];

// --- LOAD FROM PERSISTENCE ---
let FLEET_DB: VesselIntelligenceProfile[] = persistenceService.load(STORAGE_KEYS.FLEET, DEFAULT_FLEET);
persistenceService.save(STORAGE_KEYS.FLEET, FLEET_DB);

export const marinaExpert = {
    
    getAllFleetVessels: (): VesselIntelligenceProfile[] => {
        return FLEET_DB;
    },
    
    getVesselIntelligence: async (vesselName: string): Promise<VesselIntelligenceProfile | undefined> => {
        if (!vesselName) return undefined;
        return FLEET_DB.find(v => v.name.toLowerCase().includes(vesselName.toLowerCase()));
    },

    // --- HYBRID TELEMETRY FETCH ---
    getVesselTelemetry: async (vesselName: string): Promise<VesselSystemsStatus | null> => {
        // 1. Try Backend (Hyperscale Mode)
        try {
            const remoteData = await invokeAgentSkill('marina', 'get_telemetry', { vessel_name: vesselName });
            if (remoteData && remoteData.battery) {
                console.log(`[Telemetry] Received live data for ${vesselName} from Python backend.`);
                return remoteData as VesselSystemsStatus;
            }
        } catch (e) {
            console.warn("Backend telemetry fetch failed, falling back to local simulation.");
        }

        // 2. Local Simulation Fallback
        return {
            battery: { serviceBank: 25.4, engineBank: 26.1, status: 'DISCHARGING' },
            tanks: { fuel: 45, freshWater: 80, blackWater: 15 },
            bilge: { forward: 'DRY', aft: 'DRY', pumpStatus: 'AUTO' },
            shorePower: { connected: true, voltage: 228, amperage: 12.5 },
            comfort: {
                climate: { zone: 'Salon', currentTemp: 24, mode: 'OFF' }
            }
        };
    },

    // ATC Radar Scan (Updated for 20 Mile Radius)
    scanSector: async (lat: number, lng: number, radiusMiles: number = 20, addTrace: (t: AgentTraceLog) => void): Promise<AisTarget[]> => {
        addTrace(createLog('ada.marina', 'THINKING', `Scanning Radar Sector: ${radiusMiles}nm radius around ${lat.toFixed(4)}, ${lng.toFixed(4)}...`, 'EXPERT'));
        
        // 1. Try Backend Radar (Kpler/AIS Integration)
        try {
            const backendTargets = await invokeAgentSkill('marina', 'scan_radar', { lat, lng, radius: radiusMiles });
            if (backendTargets && Array.isArray(backendTargets)) {
                addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `Backend Radar: Found ${backendTargets.length} targets within ${radiusMiles}nm.`, 'WORKER'));
                return backendTargets;
            }
        } catch (e) {
             console.warn("Backend radar scan failed.");
        }

        // 2. Local Fallback (Simulation)
        const localTargets = FLEET_DB.filter(v => {
            if (!v.coordinates) return false;
            const dist = haversineDistance(lat, lng, v.coordinates.lat, v.coordinates.lng);
            return dist <= radiusMiles;
        }).map(v => ({
            name: v.name,
            type: v.type,
            distance: haversineDistance(lat, lng, v.coordinates!.lat, v.coordinates!.lng).toFixed(1),
            coordinates: v.coordinates!
        })) as AisTarget[];

        addTrace(createLog('ada.marina', 'OUTPUT', `Radar Contact: ${localTargets.length} Targets (Local Fallback).`, 'WORKER'));
        return localTargets;
    },

    // NEW SKILL: Check Charter Fleet Availability
    checkCharterFleetAvailability: async (type: string, date: string, addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        addTrace(createLog('ada.marina', 'THINKING', `Checking Charter Fleet availability for ${type} on ${date}...`, 'EXPERT'));
        
        // Fixed: Use optional chaining for charter_fleet in MasterData assets
        const fleet = wimMasterData.assets?.charter_fleet || [];
        // Simple filter logic
        const available = fleet.filter((boat: any) => 
            boat.status === 'Available' && 
            (type === 'Any' || !type || boat.type.toLowerCase().includes(type.toLowerCase()))
        );

        addTrace(createLog('ada.marina', 'OUTPUT', `Found ${available.length} vessels available for charter.`, 'WORKER'));
        return available;
    },
    
    // Skill: Proactive Hail (Welcome Home Protocol - Episode A)
    generateProactiveHail: async (vesselName: string, tenantConfig: TenantConfig, distanceNm: number = 6.0, addTrace?: (t: AgentTraceLog) => void): Promise<string> => {
        
        if (addTrace) addTrace(createLog('ada.marina', 'THINKING', `Analyzing 'Welcome Home' trigger for ${vesselName} at ${distanceNm}nm...`, 'EXPERT'));

        // Load Config from Tenant (or Fallback to Hardcoded Defaults)
        const config = tenantConfig.masterData.protocol_config?.welcome_hail || {
            channel: "72",
            template: "Good day, Captain. We have you on AIS approach at {distance} miles. Your berth {berth} is ready. {tender} has been dispatched to intercept and assist you at the breakwater.",
            trigger_distance_min: 5,
            trigger_distance_max: 7
        };

        // TRIGGER LOGIC
        if (distanceNm < config.trigger_distance_min) {
             if (addTrace) addTrace(createLog('ada.marina', 'OUTPUT', `Vessel ${vesselName} is close (${distanceNm}nm). Assuming handover complete.`, 'WORKER'));
             return `INFO: Vessel ${vesselName} is on final approach (${distanceNm}nm).`;
        }
        
        if (distanceNm > config.trigger_distance_max) {
             if (addTrace) addTrace(createLog('ada.marina', 'OUTPUT', `Vessel ${vesselName} is too far (${distanceNm}nm). Monitoring.`, 'WORKER'));
             return `INFO: Vessel ${vesselName} is monitoring range (${distanceNm}nm). Standby.`;
        }

        // Logic for Active Window
        const pilotBoat = wimMasterData.assets?.tenders.find(t => t.assignment === 'ARRIVAL_PILOT') || wimMasterData.assets?.tenders[0];
        const assignedBerth = "C-12"; // Dynamic lookup in real db

        if (addTrace) {
            addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `PROTOCOL ACTIVE: Contract Holder in range. Dispatching Tender: ${pilotBoat?.name}.`, 'WORKER'));
            addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `Alerting Concierge: Prepare Golf Cart at Pontoon C Gate.`, 'WORKER'));
        }

        // Apply Template Variables
        let messageBody = config.template
            .replace('{vessel}', vesselName)
            .replace('{distance}', distanceNm.toString())
            .replace('{berth}', `**${assignedBerth}**`)
            .replace('{tender}', `**${pilotBoat?.name}**`);

        return `**📡 PROACTIVE HAIL SEQUENCE (Auto-Trigger @ ${distanceNm}nm)**\n\n` + 
               `**To:** ${vesselName}\n` +
               `**From:** ${tenantConfig.name} Control (Ada)\n\n` +
               `"${messageBody}\n` +
               `Please monitor Channel ${config.channel}."\n\n` +
               `*Action: Tender ${pilotBoat?.id} deployed.*`; 
    },
    
    processDeparture: async (vesselName: string, currentTenders: Tender[], tenantConfig: TenantConfig, addTrace: (t: AgentTraceLog) => void): Promise<any> => {
        return { success: true, message: "Cleared", actions: [] };
    },
    
    processArrival: async (vesselName: string, currentTenders: Tender[], debtStatus: any, tenantConfig: TenantConfig, addTrace: (t: AgentTraceLog) => void): Promise<any> => {
        return { success: true, message: "Welcome", actions: [] };
    }
};

export const marinaHandlers: Record<string, TaskHandlerFn> = {
  // ... handlers
};
