
import { TaskHandlerFn } from '../decomposition/types';
import { AgentAction, AgentTraceLog, VesselIntelligenceProfile, NodeName, Tender, VesselSystemsStatus, AisTarget, TenantConfig } from '../../types';
import { haversineDistance, getCurrentMaritimeTime } from '../utils';
import { persistenceService, STORAGE_KEYS } from '../persistence'; 
import { checkBackendHealth, invokeAgentSkill } from '../api'; // Import API helpers
import { facilityExpert } from './facilityAgent'; // Import Facility for AURA

// Helper to create a log
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
        dwt: 150, loa: 20.4, beam: 5.6, status: 'DOCKED', location: 'Pontoon C-12', 
        relationship: 'CONTRACT_HOLDER', // GOLD MEMBER
        coordinates: { lat: 40.9634, lng: 28.6289 }, // Inside Marina
        voyage: { lastPort: 'Alicante', nextPort: 'WIM', eta: 'Arrived' },
        paymentHistoryStatus: 'REGULAR',
        adaSeaOneStatus: 'INACTIVE', 
        utilities: { electricityKwh: 450.2, waterM3: 12.5, lastReading: 'Today 08:00', status: 'ACTIVE' }
    },
    { 
        name: 'M/Y Blue Horizon', imo: '123456789', type: 'Motor Yacht', flag: 'KY', 
        ownerName: 'Jane Smith', ownerId: '98765432109', ownerEmail: 'jane.smith@example.com', ownerPhone: '+447911123456',
        dwt: 300, loa: 24.0, beam: 6.1, status: 'DOCKED', location: 'Pontoon A-05', 
        relationship: 'CONTRACT_HOLDER',
        coordinates: { lat: 40.9640, lng: 28.6295 }, 
        voyage: { lastPort: 'Monaco', nextPort: 'WIM', eta: 'N/A' },
        adaSeaOneStatus: 'ACTIVE',
        utilities: { electricityKwh: 1200.5, waterM3: 45.0, lastReading: 'Today 08:00', status: 'ACTIVE' }
    },
    { 
        name: 'S/Y Mistral', imo: '555666777', type: 'Sailing Yacht', flag: 'TR', 
        dwt: 120, loa: 14.2, beam: 4.1, status: 'AT_ANCHOR', location: 'Sector Zulu', 
        relationship: 'VISITOR',
        coordinates: { lat: 40.9500, lng: 28.6300 }, 
        voyage: { lastPort: 'Bodrum', nextPort: 'WIM', eta: 'N/A' },
        utilities: { electricityKwh: 0, waterM3: 0, lastReading: 'Disconnected', status: 'DISCONNECTED' }
    },
    { 
        name: 'M/Y Poseidon', imo: '888999000', type: 'Superyacht', flag: 'BS', 
        ownerName: 'Michael Johnson', ownerId: 'A123B456C',
        dwt: 499, loa: 32.5, beam: 7.8, status: 'DOCKED', location: 'VIP Quay', 
        relationship: 'RESERVATION', // INCOMING VIP
        coordinates: { lat: 40.9650, lng: 28.6270 }, 
        voyage: { lastPort: 'Antalya', nextPort: 'Dubrovnik', eta: '2025-11-28' },
        adaSeaOneStatus: 'ACTIVE',
        utilities: { electricityKwh: 3500.0, waterM3: 120.0, lastReading: 'Today 08:05', status: 'ACTIVE' }
    }
];

// --- LOAD FROM PERSISTENCE ---
let FLEET_DB: VesselIntelligenceProfile[] = persistenceService.load(STORAGE_KEYS.FLEET, DEFAULT_FLEET);

// FIX: Force S/Y Phisedelia to DOCKED if it was stuck in INBOUND from previous state
const phisedelia = FLEET_DB.find(v => v.name.includes('Phisedelia'));
if (phisedelia && phisedelia.status === 'INBOUND') {
    phisedelia.status = 'DOCKED';
    phisedelia.location = 'Pontoon C-12';
}

persistenceService.save(STORAGE_KEYS.FLEET, FLEET_DB);

const identifyVessel: TaskHandlerFn = async (ctx, obs) => {
  const vesselName = obs.payload?.text?.match(/([A-Z/Y ]+)/)?.[0]?.trim() || 'Unknown Vessel';
  console.log(`[Agent: Marina] Identifying vessel: ${vesselName}`);
  return [{
    id: `act_${Date.now()}`,
    kind: 'internal',
    name: 'marina.vessel.identified',
    params: { vessel: vesselName, priority: 4 }, 
  }];
};

const dispatchTender: TaskHandlerFn = async (ctx, obs) => {
  return [{
    id: `act_${Date.now()}`,
    kind: 'external',
    name: 'marina.dispatchTender',
    params: { tenderId: 'T-01', vessel: 'S/Y Phisedelia' },
  }];
};

export const marinaHandlers: Record<string, TaskHandlerFn> = {
  'marina.identifyVessel': identifyVessel,
  'marina.dispatchTender': dispatchTender,
};

// --- DIRECT AGENT INTERFACE ---
export const marinaExpert = {
    
    getAllFleetVessels: (): VesselIntelligenceProfile[] => {
        return FLEET_DB;
    },
    
    getVesselIntelligence: async (vesselName: string): Promise<VesselIntelligenceProfile | undefined> => {
        if (!vesselName) return undefined;
        return FLEET_DB.find(v => v.name.toLowerCase().includes(vesselName.toLowerCase()));
    },

    // --- HYBRID TELEMETRY FETCH (PYTHON FIRST, MOCK FALLBACK) ---
    getVesselTelemetry: async (vesselName: string): Promise<VesselSystemsStatus | null> => {
        
        // 1. Try Python Backend (Real IoT/Database)
        const isBackendUp = await checkBackendHealth();
        if (isBackendUp) {
            const remoteData = await invokeAgentSkill('marina', 'get_telemetry', { vessel_name: vesselName });
            if (remoteData) {
                console.log(`[Telemetry] Received live data for ${vesselName} from Python backend.`);
                return remoteData as VesselSystemsStatus;
            }
        }

        // 2. Local Simulation Fallback
        console.info(`[Telemetry] Backend offline. Using local simulation for ${vesselName}.`);
        
        return {
            battery: { serviceBank: 25.4, engineBank: 26.1, status: 'DISCHARGING' },
            tanks: { fuel: 45, freshWater: 80, blackWater: 15 },
            bilge: { forward: 'DRY', aft: 'DRY', pumpStatus: 'AUTO' },
            shorePower: { connected: true, voltage: 228, amperage: 12.5 },
            // IoT Status (Ada Sea ONE)
            comfort: {
                climate: { zone: 'Salon', setPoint: 21, currentTemp: 24, mode: 'OFF', fanSpeed: 'LOW' },
                lighting: { salon: false, deck: false, underwater: false },
                security: { mode: 'ARMED', camerasActive: true }
            }
        };
    },

    // To update status locally for the demo
    activateAdaSeaOne: async (vesselName: string) => {
        const idx = FLEET_DB.findIndex(v => v.name.toLowerCase().includes(vesselName.toLowerCase()));
        if (idx >= 0) {
            FLEET_DB[idx].adaSeaOneStatus = 'ACTIVE';
            persistenceService.save(STORAGE_KEYS.FLEET, FLEET_DB);
        }
    },

    // ATC Radar Scan (20nm radius + Ambarlı Commercial Traffic)
    scanSector: async (lat: number, lng: number, radiusMiles: number, addTrace: (t: AgentTraceLog) => void): Promise<AisTarget[]> => {
        addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `Scanning Radar Sector: ${radiusMiles}nm radius around ${lat}, ${lng}...`, 'WORKER'));
        
        // 1. WIM Fleet (Local AIS - Real Time)
        const localTargets = FLEET_DB.filter(v => {
            if (!v.coordinates) return false;
            const dist = haversineDistance(lat, lng, v.coordinates.lat, v.coordinates.lng);
            return dist <= radiusMiles;
        }).map(v => ({
            name: v.name,
            type: v.type,
            distance: haversineDistance(lat, lng, v.coordinates!.lat, v.coordinates!.lng).toFixed(1),
            squawk: '1200', // VFR Standard
            status: v.status!,
            coordinates: v.coordinates!,
            speed: v.status === 'DOCKED' ? '0.0' : '8.5',
            source: 'LOCAL_AIS' // Tagged as Local
        }));

        // 2. Ambarlı Commercial Traffic (Simulated Injection)
        const commercialTraffic: AisTarget[] = [
            { name: "M/V MSC Gulsun", type: "Container Ship", distance: "4.2", squawk: "7700", status: "CROSSING", speed: "14.0", coordinates: { lat: 40.9200, lng: 28.6100 } },
            { name: "M/T Torm Republican", type: "Chemical Tanker", distance: "6.5", squawk: "2305", status: "ANCHORED", speed: "0.0", coordinates: { lat: 40.9000, lng: 28.6000 } }
        ];

        // 3. MarineTraffic Injection (Simulating `signalk-marinetraffic-public`)
        // These are distant vessels that we "see" thanks to the plugin
        const globalTraffic: AisTarget[] = [];
        if (radiusMiles > 50) {
             globalTraffic.push({ name: "S/Y Maltese Falcon", type: "Superyacht", distance: "145.0", squawk: "3300", status: "UNDERWAY", speed: "12.0", coordinates: { lat: 39.5, lng: 26.5 }, source: 'MARINETRAFFIC' });
             addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `Connected to MarineTraffic API via SignalK. Retrieved 1 global target.`, 'WORKER'));
        }

        const allTargets = [...localTargets, ...commercialTraffic, ...globalTraffic];

        addTrace(createLog('ada.marina', 'OUTPUT', `Radar Contact: ${allTargets.length} Targets (${localTargets.length} Local, ${globalTraffic.length} Satellite).`, 'WORKER'));
        
        return allTargets;
    },

    // Alias for findVesselsNear to use scanSector logic
    findVesselsNear: async (lat: number, lng: number, radiusMiles: number, addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        return marinaExpert.scanSector(lat, lng, radiusMiles, addTrace);
    },

    // NEW: Capability to check WIM Charter Fleet Availability for Kites Travel
    checkCharterFleetAvailability: async (type: string, date: string, addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        addTrace(createLog('ada.marina', 'THINKING', `Checking availability of Marina-owned charter assets for ${date}...`, 'EXPERT'));
        
        // In a real system, this would check a booking calendar database.
        // Here we filter wimMasterData.assets.charter_fleet (Assuming fallback)
        // Since we want this to work generically, ideally we should pass fleet data, but for now we assume WIM fleet structure is available or empty
        const fleet: any[] = []; 
        const available = fleet.filter((boat: any) => boat.status === 'Available');
        
        addTrace(createLog('ada.marina', 'OUTPUT', `Found ${available.length} available charter vessels in Registry.`, 'WORKER'));
        return available;
    },

    // Proactive Hailing Logic - The "Welcome Home" Protocol (Protocol: CH16 -> CH72)
    // UPDATED: Now accepts tenantConfig to use the correct marina name
    generateProactiveHail: async (vesselName: string, tenantConfig: TenantConfig): Promise<string> => {
        const profile = await marinaExpert.getVesselIntelligence(vesselName);
        const berth = profile?.location || "C-12"; 
        const marinaName = tenantConfig.masterData.identity.name || "Marina Control";
        const vhfChannel = tenantConfig.masterData.identity.contact?.vhf_channels?.public[0] || "72";
        
        return `**📡 PROACTIVE HAIL SEQUENCE**\n\n` +
               `**[VHF CH 16 - GENERAL CALLING]**\n` +
               `> "${vesselName}, ${vesselName}, ${vesselName}. This is **${marinaName} Control**."\n` +
               `> "Captain, reading you loud and clear. Please switch to **Channel ${vhfChannel}** for arrival instructions. Over."\n\n` +
               `**[VHF CH ${vhfChannel} - OPERATIONS]**\n` +
               `> "Welcome home, Captain. We have your AIS target at 2nm."\n\n` +
               `**TRAFFIC & APPROACH:**\n` +
               `- **Sector Status:** Green. Fairway is clear.\n` +
               `- **Caution:** Keep clear of the fishing vessel exiting port side, 0.5nm ahead.\n` +
               `- **Wind:** North-West at 12 knots. Prepare port side fenders.\n\n` +
               `**ARRIVAL INSTRUCTIONS:**\n` +
               `- **Berth:** ${berth} (Your Home Berth)\n` +
               `- **Assistance:** Tender *${tenantConfig.masterData.assets?.tenders[0]?.name || 'Tender'}* is engaging to escort you.\n` +
               `- **Shore Power:** ACTIVE and waiting.\n\n` +
               `*Linesmen standing by. Standing by on ${vhfChannel}. Out.*`;
    },

    // ATC Priority Calculator
    calculateTrafficPriority: (vessel: VesselIntelligenceProfile | undefined, context?: { isMedical?: boolean, isFuelCritical?: boolean }): number => {
        if (context?.isMedical) return 1; // LEVEL 1: Emergency
        if (context?.isFuelCritical) return 2; // LEVEL 2: Distress
        
        if (!vessel) return 5;
        if (vessel.type.includes('VO65') || vessel.type === 'Superyacht') return 4; // VIP & Racing
        if (vessel.type === 'State' || vessel.type === 'Coast Guard') return 1; 
        return 5; // Standard Pleasure Craft
    },

    // ATC Departure Protocol (Strict)
    // UPDATED: Accepts tenantConfig to use correct coordinates and names
    processDeparture: async (vesselName: string, currentTenders: Tender[], tenantConfig: TenantConfig, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, actions: AgentAction[], tender?: Tender, squawk?: string }> => {
        
        const vesselProfile = await marinaExpert.getVesselIntelligence(vesselName);
        const priority = marinaExpert.calculateTrafficPriority(vesselProfile);
        const squawk = Math.floor(4000 + Math.random() * 1000).toString(); // ATC Assigns discrete code
        const marinaName = tenantConfig.masterData.identity.name;

        addTrace(createLog('ada.marina', 'THINKING', `[ATC] FLIGHT PLAN: ${vesselName} | REQ: DEPARTURE from ${marinaName} | PRIORITY: ${priority}`, 'EXPERT'));

        // 1. Check Commercial Traffic (Ambarlı Conflict)
        // Use Tenant Config Coordinates
        const coords = tenantConfig.masterData.identity.location.coordinates;
        const commercialTraffic = await marinaExpert.scanSector(coords.lat, coords.lng, 5, () => {});
        
        if (commercialTraffic.some(t => t.type.includes('Container') && parseFloat(t.distance) < 2)) {
             addTrace(createLog('ada.marina', 'WARNING', `[ATC] CONFLICT ALERT: Heavy traffic in Fairway. Holding departure.`, 'WORKER'));
             return {
                 success: false,
                 message: "NEGATIVE. Traffic Conflict. Heavy commercial traffic in departure sector. Hold position.",
                 actions: []
             };
        }

        // 2. Find Tender
        const availableTender = currentTenders.find(t => t.status === 'Idle');
        if (!availableTender) {
            addTrace(createLog('ada.marina', 'WARNING', `[ATC-GND] GROUND STOP: No Tenders available.`, 'WORKER'));
            return {
                success: false,
                message: "NEGATIVE. Ground Stop. All assets engaged. Standby for sequence.",
                actions: []
            };
        }

        addTrace(createLog('ada.marina', 'TOOL_EXECUTION', `[ATC-GND] Reserving ${availableTender.name} for ${vesselName} maneuver.`, 'WORKER'));

        const actions: AgentAction[] = [];
        actions.push({
            id: `marina_dept_${Date.now()}`,
            kind: 'external',
            name: 'ada.marina.tenderReserved',
            params: { 
                tenderId: availableTender.id,
                tenderName: availableTender.name, 
                mission: 'DEPARTURE_ASSIST',
                vessel: vesselName
            }
        });

        actions.push({
            id: `marina_traffic_${Date.now()}`,
            kind: 'internal',
            name: 'ada.marina.updateTrafficStatus',
            params: {
                vessel: vesselName,
                status: 'TAXIING',
                destination: 'SEA',
                squawk: squawk,
                priority: priority
            }
        });

        // Log the Tender Reservation explicitly
        actions.push({
            id: `marina_log_${Date.now()}`,
            kind: 'internal',
            name: 'ada.marina.log_operation',
            params: {
                message: `[ATC-DEP] TENDER RESERVED | AST:${availableTender.name.toUpperCase()} -> VS:${vesselName.toUpperCase()} | CH:14`,
                type: 'info'
            }
        });

        return {
            success: true,
            message: "Cleared for Departure.",
            tender: availableTender,
            squawk: squawk,
            actions: actions
        };
    },

    // ATC Arrival Protocol - UPDATED for AURA (Smart Lighting) & Dynamic Tenant Name
    processArrival: async (vesselName: string, currentTenders: Tender[], debtStatus: { status: 'CLEAR' | 'DEBT', amount: number }, tenantConfig: TenantConfig, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, actions: AgentAction[], tender?: Tender, squawk?: string }> => {
        
        const marinaName = tenantConfig.masterData.identity.name;
        const vhfChannel = tenantConfig.masterData.identity.contact?.vhf_channels?.public[0] || "72";

        // 1. Identify Target & Radar Lock
        let vesselProfile = await marinaExpert.getVesselIntelligence(vesselName);
        const actions: AgentAction[] = [];
        
        addTrace(createLog('ada.marina', 'THINKING', `[RADAR] SCANNING SECTOR (${marinaName} Approach)...`, 'WORKER'));
        addTrace(createLog('ada.marina', 'OUTPUT', `[RADAR] TARGET ACQUIRED: ${vesselName} | Range: 19.8nm | Bearing: 240°`, 'EXPERT'));

        // 2. Financial Audit
        addTrace(createLog('ada.marina', 'THINKING', `[AUDIT] Verifying Contract Status & Financial Standing for ${vesselName}...`, 'EXPERT'));
        
        let hasDebt = false;
        if (debtStatus.status === 'DEBT') {
             addTrace(createLog('ada.marina', 'WARNING', `[DEBT ALERT] Outstanding Balance: €${debtStatus.amount}. Protocol: ALLOW ENTRY -> SEIZE ASSET (Art H.2).`, 'EXPERT'));
             actions.push({
                 id: `flag_debt_seize_${Date.now()}`,
                 kind: 'internal',
                 name: 'ada.security.flagVessel',
                 params: { vesselName, reason: 'Right of Retention (Hapis Hakkı) - Unpaid Debt' }
             });
             hasDebt = true;
        } else {
             addTrace(createLog('ada.marina', 'OUTPUT', `[AUDIT] Financial Status: CLEAR. Contract: ACTIVE.`, 'WORKER'));
        }

        // 3. AURA PROTOCOL (Smart Lighting)
        const isMember = !!vesselProfile;
        let berth = isMember ? (vesselProfile?.location || "Pontoon C-12") : "Pontoon A-08 (Visitor)";
        let squawk = isMember ? Math.floor(1000 + Math.random() * 8999).toString() : "7001";
        
        addTrace(createLog('ada.facility', 'THINKING', `[PROJECT AURA] Activating Intelligent Lighting Protocol for ${berth}...`, 'EXPERT'));
        // Trigger Facility Agent Skill
        await facilityExpert.activateAuraProtocol(berth, 'LANDING', vesselName, addTrace);

        let welcomeMessage = isMember 
            ? `**PROACTIVE HAIL [CH 16 -> ${vhfChannel}]**\n> **"S/Y ${vesselName}, ${marinaName} Control on 16. Switch to ${vhfChannel}."**\n> **(On ${vhfChannel}):** "Welcome home, Captain. AURA Protocol Active. Follow the pulsing amber lights to **${berth}**."`
            : `**PROACTIVE HAIL [CH 16 -> ${vhfChannel}]**\n> **"S/Y ${vesselName}, ${marinaName} Control on 16. Switch to ${vhfChannel}."**\n> **(On ${vhfChannel}):** "Welcome to ${marinaName}. Proceed to **${berth}**. Pilot boat is intercepting."`;

        if (hasDebt) {
            welcomeMessage += `\n\n**⚠️ IMPORTANT:** Captain, please report to Finance immediately. Right of Retention applied.`;
        }

        // 4. Tender Dispatch
        const availableTender = currentTenders.find(t => t.status === 'Idle');
        if (!availableTender) {
             return { success: false, message: `NEGATIVE. Approach denied. Proceed to Sector Zulu.`, actions: [] };
        }

        actions.push({
            id: `marina_arr_${Date.now()}`,
            kind: 'external',
            name: 'ada.marina.tenderReserved',
            params: { tenderId: availableTender.id, tenderName: availableTender.name, mission: 'ARRIVAL_PILOT', vessel: vesselName }
        });

        actions.push({
            id: `marina_log_arr_${Date.now()}`,
            kind: 'internal',
            name: 'ada.marina.log_operation',
            params: { message: `[ATC-ARR] AURA ACTIVE | TARGET:${vesselName} | BERTH:${berth}`, type: 'info' }
        });

        return {
            success: true,
            message: welcomeMessage,
            tender: availableTender,
            squawk: squawk,
            actions: actions
        };
    }
};