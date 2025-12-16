
import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { sendToBackend, checkBackendHealth } from './api';

// --- LOCAL EXPERTS (The Edge Brain) ---
import { hrExpert } from './agents/hrAgent';
import { financeExpert } from './agents/financeAgent';
import { marinaExpert } from './agents/marinaAgent';
import { securityExpert } from './agents/securityAgent';
import { facilityExpert } from './agents/facilityAgent';
import { commercialExpert } from './agents/commercialAgent';
import { analyticsExpert } from './agents/analyticsAgent';
import { legalExpert } from './agents/legalAgent';
import { itExpert } from './agents/itAgent';
import { berthExpert } from './agents/berthAgent';
import { technicExpert } from './agents/technicAgent';
import { reservationsExpert } from './agents/reservationsAgent';
import { kitesExpert } from './agents/travelAgent';
import { systemExpert } from './agents/systemAgent';
import { scienceExpert } from './agents/scienceAgent';
import { roboticsExpert } from './agents/roboticsAgent';
import { shieldExpert } from './agents/shieldAgent';
import { yieldExpert } from './agents/yieldAgent';
import { seaExpert } from './agents/seaAgent';
import { conciergeExpert } from './agents/conciergeAgent';
import { federationExpert } from './agents/federationAgent';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const orchestratorService = {
    async processRequest(
        prompt: string, 
        user: UserProfile, 
        tenders: Tender[],
        registry: RegistryEntry[] = [],
        vesselsInPort: number = 0,
        messages: Message[] = [],
        activeTenantConfig: TenantConfig
    ): Promise<OrchestratorResponse> {
        const traces: AgentTraceLog[] = [];
        let actions: AgentAction[] = [];
        let responseText = "";

        const addTrace = (t: AgentTraceLog) => traces.push(t);

        // 1. ROUTING
        addTrace(createLog('ada.stargate', 'ROUTING', `Analyzing Intent for ${activeTenantConfig.name}: "${prompt}"`, 'ORCHESTRATOR'));

        const lowerPrompt = prompt.toLowerCase();

        // --- SPECIAL UI TRIGGERS (PRESENTER MODE) ---
        if (lowerPrompt.includes('sunum') || lowerPrompt.includes('present') || lowerPrompt.includes('toplantı') || lowerPrompt.includes('meeting')) {
            addTrace(createLog('ada.stargate', 'PLANNING', `Activating Executive Presentation Protocol...`, 'EXPERT'));
            actions.push({
                id: `ui_present_${Date.now()}`,
                kind: 'internal',
                name: 'ada.mission_control.start_presentation',
                params: {}
            });
            responseText = "**PRESENTATION MODE INITIATED**\n\nStand by. Taking over main screen.";
        }

        // --- FEDERATION (Setur/D-Marin Cross Check) ---
        else if (lowerPrompt.includes('availability') && (lowerPrompt.includes('other marina') || lowerPrompt.includes('partner'))) {
             // Example extraction logic
             const target = lowerPrompt.includes('kalamis') ? 'TR_KAL' : 'TR_GOC'; 
             const fedResult = await federationExpert.getRemoteBerthAvailability(target, 'TODAY', addTrace);
             if (fedResult) responseText = fedResult.message;
        }

        // --- MARINA OPS ---
        else if (lowerPrompt.includes('hail') || lowerPrompt.includes('arrival') || lowerPrompt.includes('depart') || lowerPrompt.includes('traffic')) {
            if (lowerPrompt.includes('depart')) {
                // Parse vessel name roughly
                const vesselName = "S/Y Phisedelia"; // Simplified for demo
                const res = await marinaExpert.processDeparture(vesselName, tenders, activeTenantConfig, addTrace);
                responseText = res.message;
                actions = res.actions;
            } else if (lowerPrompt.includes('arrival')) {
                const res = await marinaExpert.processArrival("S/Y Phisedelia", tenders, { status: 'CLEAR', amount: 0 }, activeTenantConfig, addTrace);
                responseText = res.message;
                actions = res.actions;
            } else if (lowerPrompt.includes('hail')) {
                const hail = await marinaExpert.generateProactiveHail("S/Y Phisedelia", activeTenantConfig);
                responseText = hail;
            } else {
                // Radar / Traffic
                const targets = await marinaExpert.scanSector(activeTenantConfig.masterData.identity.location.coordinates.lat, activeTenantConfig.masterData.identity.location.coordinates.lng, 10, addTrace);
                responseText = `**RADAR SCAN COMPLETE**\n\nDetected ${targets.length} targets in ${activeTenantConfig.name} approach sector.`;
            }
        }

        // --- FINANCE ---
        else if (lowerPrompt.includes('invoice') || lowerPrompt.includes('debt') || lowerPrompt.includes('pay')) {
            const res = await financeExpert.process({ intent: 'create_invoice', vesselName: 'S/Y Phisedelia' }, user, addTrace);
            actions = res;
            responseText = "**FINANCIAL OPERATION INITIATED**\n\nInvoice generation sequence started. Please check the Finance module.";
        }

        // --- LEGAL ---
        else if (lowerPrompt.includes('rule') || lowerPrompt.includes('law') || lowerPrompt.includes('regulation')) {
            const res = await legalExpert.process({ query: prompt }, user, addTrace);
            // Assuming the first action contains the text response in params
            if (res.length > 0 && res[0].params.advice) {
                responseText = res[0].params.advice;
            } else {
                responseText = "I've consulted the legal archives.";
            }
        }

        // --- TRAVEL (KITES) ---
        else if (lowerPrompt.includes('flight') || lowerPrompt.includes('hotel') || lowerPrompt.includes('transfer')) {
            const res = await kitesExpert.searchFlights('IST', 'LHR', '2025-11-25', addTrace);
            responseText = res.message;
        }

        // --- SYSTEM ADMIN ---
        else if (lowerPrompt.includes('update') && (lowerPrompt.includes('rule') || lowerPrompt.includes('config'))) {
            const res = await systemExpert.processRuleUpdate(prompt, addTrace);
            responseText = res.message;
            actions = res.actions;
        }

        // --- DEFAULT FALLBACK (LLM) ---
        // If no specific agent handled it, or if responseText is still empty
        if (!responseText) {
             // In a real app, we would query the LLM here using genericAgent or similar
             // For this mock orchestrator, we leave it empty to let the UI handle the "..." loading state which triggers streamChatResponse
        }

        return {
            text: responseText,
            actions: actions,
            traces: traces
        };
    }
};
