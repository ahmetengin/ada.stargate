
import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { checkBackendHealth, sendToBackend } from './api';

// --- "BÜYÜK 4" UZMANLARININ İÇE AKTARILMASI ---
import { hrExpert } from './agents/hrAgent';
import { financeExpert } from './agents/financeAgent';
import { marinaExpert } from './agents/marinaAgent';
import { securityExpert } from './agents/securityAgent';
import { facilityExpert } from './agents/facilityAgent';
import { commercialExpert } from './agents/commercialAgent';
import { customerExpert } from './agents/customerAgent';
import { analyticsExpert } from './agents/analyticsAgent';
import { legalExpert } from './agents/legalAgent';
import { itExpert } from './agents/itAgent';
import { berthExpert } from './agents/berthAgent';
import { technicExpert } from './agents/technicAgent';
import { reservationsExpert } from './agents/reservationsAgent';
import { federationExpert } from './agents/federationAgent';
import { kitesExpert } from './agents/travelAgent'; // Kites Travel

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
        const actions: AgentAction[] = [];
        const lowerPrompt = prompt.toLowerCase();
        
        const addTrace = (t: AgentTraceLog) => traces.push(t);

        // --- HİBRİT BEYİN KONTROLÜ ---
        const isBackendOnline = await checkBackendHealth();
        if (isBackendOnline) {
            traces.push(createLog('ada.stargate', 'ROUTING', `Hybrid Core: ONLINE. Routing to Hyperscale Brain...`));
            try {
                const backendResponse = await sendToBackend(prompt, user, { active_tenant: activeTenantConfig.id });
                if (backendResponse) {
                    traces.push(...(backendResponse.traces || []));
                    actions.push(...(backendResponse.actions || []));
                    return { text: backendResponse.text, actions, traces };
                }
            } catch (err) {
                traces.push(createLog('ada.stargate', 'ERROR', `Hybrid Link Failed. Falling back to Local Logic.`));
            }
        } else {
            traces.push(createLog('ada.stargate', 'WARNING', `Hybrid Core: OFFLINE. Engaging Local Emergency Protocols.`));
        }

        // --- YEREL ORKESTRATÖR: "BÜYÜK 4" MANTIK AKIŞI ---
        try {
            // --- 1. ADA.LEGAL (Hukuk Müşaviri) ---
            // Sorumluluk: Kurallar, kanunlar, güvenlik, kimlik, personel.
            if (['rule', 'law', 'contract', 'sale', 'staff', 'patrol', 'security', 'cctv', 'pass', 'kvkk'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: LEGAL/SECURITY -> Delegating to Ada.Legal`));
                
                if (lowerPrompt.includes('staff') || lowerPrompt.includes('patrol')) {
                    const result = await hrExpert.trackPatrolStatus(addTrace);
                    return { text: result.message, actions, traces };
                }
                
                const legalRes = await legalExpert.process({ query: prompt }, user, addTrace);
                const advice = legalRes[0]?.params?.advice || "Consulting legal database...";
                return { text: advice, actions, traces };
            }

            // --- 2. ADA.FINANCE (CFO) ---
            // Sorumluluk: Para, borç, fatura, müşteri değeri, rezervasyon.
            if (['balance', 'debt', 'owe', 'finance', 'invoice', 'price', 'fee', 'commercial', 'shop', 'tenant', 'loyalty', 'booking', 'reservation'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: FINANCE/COMMERCIAL -> Delegating to Ada.Finance`));

                if (lowerPrompt.includes('balance') || lowerPrompt.includes('debt')) {
                    const debtInfo = await financeExpert.checkDebt("S/Y Phisedelia");
                    const responseText = debtInfo.status === 'DEBT' 
                        ? `⚠️ **OUTSTANDING BALANCE:** €${debtInfo.amount.toFixed(2)} (Status: ${debtInfo.paymentHistoryStatus})`
                        : `✅ **ACCOUNT CLEAR**`;
                    return { text: responseText, actions, traces };
                }
                
                if (lowerPrompt.includes('shop') || lowerPrompt.includes('tenant')) {
                    const mixAnalysis = await commercialExpert.analyzeRetailMix(addTrace);
                    return { text: mixAnalysis, actions, traces };
                }

                const booking = await reservationsExpert.processBooking({ name: "S/Y Wind Chaser", type: "Sailing Yacht", loa: 16, beam: 4.5 }, { start: "2025-06-10", end: "2025-06-15" }, addTrace);
                return { text: booking.message, actions, traces };
            }

            // --- 3. ADA.MARINA (Operatör) ---
            // Sorumluluk: Fiziksel dünya. Tekneler, palamar, hava, su, elektrik, rıhtım.
            if (['arrival', 'departure', 'dock', 'berth', 'tender', 'water', 'electricity', 'waste', 'blue card', 'weather', 'facility', 'technical', 'lift'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: MARINA_OPS -> Delegating to Ada.Marina`));
                
                if (lowerPrompt.includes('arrival')) {
                    const result = await marinaExpert.processArrival("S/Y Phisedelia", tenders, { status: 'DEBT', amount: 850 }, addTrace);
                    actions.push(...result.actions);
                    return { text: result.message, actions, traces };
                }

                if (lowerPrompt.includes('blue card')) {
                    const res = await technicExpert.processBlueCard("S/Y Phisedelia", "Fuel Dock", 150, addTrace);
                    actions.push(...res.actions);
                    return { text: res.message, actions, traces };
                }

                const vessel = { loa: 20.4, beam: 5.6, draft: 3.5, type: "VO65 Racing Yacht" };
                const berth = await berthExpert.findOptimalBerth(vessel, addTrace);
                return { text: `**BERTH ALLOCATION:** ${berth.berth} - ${berth.reasoning}`, actions, traces };
            }

            // --- 4. ADA.STARGATE (Beyin & Dış Dünya) ---
            // Sorumluluk: Sistem, ağ, analitik, seyahat, genel sohbet.
            traces.push(createLog('ada.stargate', 'ROUTING', `Intent: SYSTEM/GENERAL -> Delegating to Ada.Stargate`));
            
            if (['system', 'status', 'connect', 'offline', 'cyber'].some(kw => lowerPrompt.includes(kw))) {
                const result = await itExpert.checkConnectivity(addTrace);
                return { text: result.message, actions, traces };
            }

            if (['predict', 'forecast', 'analytics'].some(kw => lowerPrompt.includes(kw))) {
                const data = await analyticsExpert.predictOccupancy('3M', addTrace);
                return { text: data.message, actions, traces };
            }
            
            if (['flight', 'hotel', 'travel', 'kites'].some(kw => lowerPrompt.includes(kw))) {
                 const res = await kitesExpert.searchFlights("IST", "LHR", "tomorrow", addTrace);
                 return { text: res.message, actions, traces };
            }

            // Genel sohbet için Gemini'ye yönlendir
            return { text: "", actions, traces };

        } catch (error: any) {
            traces.push(createLog('ada.stargate', 'ERROR', `Local Logic Failure: ${error.message}`));
            return { text: "⚠️ **SYSTEM ERROR:** Local protocols failed.", actions: [], traces };
        }
    }
};
