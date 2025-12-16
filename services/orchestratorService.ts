
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

        // --- PHASE 1: CONNECTIVITY CHECK ---
        // We check if the Python Brain is alive. If not, we switch to "EDGE MODE" smoothly.
        let useEdgeMode = true;
        
        try {
            const isBackendAlive = await checkBackendHealth();
            if (isBackendAlive) {
                useEdgeMode = false;
                // Attempt to contact Python Backend
                const backendResponse = await sendToBackend(prompt, user, { 
                    vesselsInPort, 
                    weather: "NW 12kn",
                    userRole: user.role 
                });

                if (backendResponse && backendResponse.text) {
                    const backendTrace = createLog('ada.stargate', 'THINKING', `[CLOUD] Processed via Hyperscale Node. Intent: ${backendResponse.traces?.[0]?.content || 'Processed'}`);
                    
                    if (backendResponse.traces) {
                        backendResponse.traces.forEach((t: any) => {
                           traces.push(createLog('ada.stargate', 'OUTPUT', `Backend: ${t.content}`)); 
                        });
                    } else {
                        traces.push(backendTrace);
                    }

                    return {
                        text: backendResponse.text,
                        actions: backendResponse.actions || [],
                        traces: traces
                    };
                }
            }
        } catch (e) {
            // Backend failed or didn't respond, proceed to Edge Mode
            useEdgeMode = true;
        }

        // --- PHASE 2: EDGE ORCHESTRATION (Browser-Based Intelligence) ---
        // This runs purely in the browser, using the imported TypeScript agents.
        
        traces.push(createLog('ada.stargate', 'ROUTING', `⚡ NEURAL SHIFT: Switching to EDGE COMPUTE (Local Browser Runtime).`));

        try {
            
            // 0. SIGNALK TELEMETRY (NEW - Ada.Sea)
            if (['wind', 'rüzgar', 'depth', 'derinlik', 'speed', 'hız', 'sog', 'telemetry', 'sensor'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: TELEMETRY -> Delegating to Ada.Sea (SignalK MCP)`));
                const res = await seaExpert.getSignalKData(lowerPrompt, addTrace);
                return { text: res.message, actions, traces };
            }

            // A. CONCIERGE (Hospitality & Services)
            if (['buggy', 'golf cart', 'shuttle', 'ice', 'coffee', 'latte', 'espresso', 'cleaning', 'laundry', 'wash', 'taxi', 'cab', 'transfer', 'valet'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: CONCIERGE -> Delegating to Ada.Concierge (Local)`));
                
                let res;
                if (lowerPrompt.includes('buggy') || lowerPrompt.includes('golf') || lowerPrompt.includes('shuttle')) {
                    res = await conciergeExpert.requestBuggy("Current Location (GPS)", addTrace);
                } else if (lowerPrompt.includes('taxi') || lowerPrompt.includes('cab') || lowerPrompt.includes('transfer') || lowerPrompt.includes('valet')) {
                    res = await conciergeExpert.callTaxi("Main Gate", "Airport", addTrace);
                } else if (lowerPrompt.includes('cleaning') || lowerPrompt.includes('laundry') || lowerPrompt.includes('wash')) {
                    res = await conciergeExpert.scheduleService("Interior Cleaning", "S/Y Phisedelia", "14:00", addTrace);
                } else {
                    const items = lowerPrompt.replace(/order|please|bring|need/g, '').trim();
                    res = await conciergeExpert.orderProvisions(items, "S/Y Phisedelia", addTrace);
                }
                
                return { text: res.message, actions, traces };
            }

            // B. ROBOTICS (Subsea & Air)
            if (['robot', 'drone', 'hull', 'clean', 'inspection', 'fly'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: ROBOTICS -> Delegating to Ada.Robotics (Local)`));
                
                if (lowerPrompt.includes('hull') || lowerPrompt.includes('clean') || lowerPrompt.includes('inspect')) {
                    const action = lowerPrompt.includes('clean') ? 'CLEAN' : 'INSPECT';
                    const res = await roboticsExpert.manageHullCleaner("S/Y Phisedelia", action, addTrace);
                    return { text: res.message, actions, traces };
                } else if (lowerPrompt.includes('drone') || lowerPrompt.includes('fly')) {
                    const res = await roboticsExpert.dispatchAerialDrone("Emergency MedKit", "Pontoon C", addTrace);
                    return { text: `**DRONE DISPATCHED**\nID: ${res.droneId}\nETA: ${res.eta}`, actions, traces };
                }
            }

            // C. SHIELD (Security & EW)
            if (['shield', 'jam', 'dome', 'sonar', 'diver', 'perimeter'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: SHIELD -> Delegating to Ada.Shield (Local)`));
                
                if (lowerPrompt.includes('jam') || lowerPrompt.includes('dome')) {
                    const res = await shieldExpert.activateDome('JAMMING', 10, addTrace);
                    return { text: `**SHIELD STATUS: ${res.status}**\nCoverage: ${res.coverage}`, actions, traces };
                } else {
                    const threats = await shieldExpert.analyzeSubseaThreats("Alpha", addTrace);
                    return { text: threats.length > 0 ? "**THREAT DETECTED**\nSubsea contact confirmed." : "No subsea threats in sector.", actions, traces };
                }
            }

            // D. YIELD (Dynamic Pricing)
            if (['yield', 'price', 'rate', 'forecast', 'revenue'].some(kw => lowerPrompt.includes(kw)) && user.role === 'GENERAL_MANAGER') {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: YIELD -> Delegating to Ada.Yield (Local)`));
                
                if (lowerPrompt.includes('forecast')) {
                    const res = await yieldExpert.forecastRevenue(30, addTrace);
                    return { text: res, actions, traces };
                } else {
                    const res = await yieldExpert.calculateMultiplier(92, 'HIGH', addTrace);
                    return { text: `**DYNAMIC PRICING**\nCurrent Multiplier: **${res.multiplier}x**\nReason: ${res.reasoning}`, actions, traces };
                }
            }

            // E. SYSTEM ADMINISTRATION (RULES & CONFIG)
            if (['update', 'change', 'set'].some(kw => lowerPrompt.includes(kw)) && ['rule', 'limit', 'config', 'parameter', 'policy'].some(kw => lowerPrompt.includes(kw))) {
                if (user.role !== 'GENERAL_MANAGER') {
                    traces.push(createLog('ada.stargate', 'ERROR', `Access Denied: Rule modification requires EXECUTIVE clearance.`));
                    return { text: "⛔ **ACCESS DENIED**\n\nOnly General Managers are authorized to modify Operational Rules.", actions: [], traces };
                }
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: SYSTEM_ADMIN -> Delegating to Ada.System`));
                const result = await systemExpert.processRuleUpdate(prompt, addTrace);
                actions.push(...result.actions);
                return { text: result.message, actions, traces };
            }

            // F. LEGAL, SECURITY & PRACTICAL KNOWLEDGE
            if (['rule', 'law', 'contract', 'sale', 'staff', 'patrol', 'security', 'cctv', 'pass', 'kvkk', 'anchor', 'demir', 'meltemi', 'wind', 'battery', 'akü', 'chain', 'zincir', 'colreg'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: LEGAL/SECURITY -> Delegating to Ada.Legal (RAG)`));
                
                if (lowerPrompt.includes('colreg')) {
                    const res = await seaExpert.evaluateSituation({ heading: 0 }, { bearing: 45, range: 0.5, name: 'Target' }, 'GOOD', addTrace);
                    return { text: `**COLREGs ADVISORY**\nRule: ${res.rule}\nAction: **${res.action}**`, actions, traces };
                }

                if (lowerPrompt.includes('staff') || lowerPrompt.includes('patrol')) {
                    const result = await hrExpert.trackPatrolStatus(addTrace);
                    return { text: result.message, actions, traces };
                }
                
                const legalRes = await legalExpert.process({ query: prompt }, user, addTrace);
                const advice = legalRes[0]?.params?.advice || "Consulting knowledge base...";
                return { text: advice, actions, traces };
            }

            // G. FINANCE & COMMERCIAL
            if (['balance', 'debt', 'owe', 'finance', 'invoice', 'fee', 'commercial', 'shop', 'tenant', 'loyalty', 'booking', 'reservation'].some(kw => lowerPrompt.includes(kw))) {
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

            // H. MARINA OPERATIONS & SCIENCE
            if (['arrival', 'departure', 'dock', 'berth', 'tender', 'water', 'electricity', 'waste', 'blue card', 'weather', 'facility', 'technical', 'lift', 'science', 'mission', 'ocean', 'research'].some(kw => lowerPrompt.includes(kw))) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent: MARINA_OPS -> Delegating to Ada.Marina`));
                
                if (lowerPrompt.includes('science') || lowerPrompt.includes('mission') || lowerPrompt.includes('ocean')) {
                    const mission = await scienceExpert.assignMission("S/Y Phisedelia", "Sector Zulu", addTrace);
                    return { text: mission, actions, traces };
                }

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

            // I. SYSTEM & STARGATE (Default)
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

            // Return empty to trigger Client-Side LLM fallback in App.tsx
            return { text: "", actions, traces };

        } catch (error: any) {
            traces.push(createLog('ada.stargate', 'ERROR', `Local Logic Failure: ${error.message}`));
            return { text: "⚠️ **SYSTEM ERROR:** Local protocols failed.", actions: [], traces };
        }
    }
};
