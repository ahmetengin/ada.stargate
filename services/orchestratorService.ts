
// services/orchestratorService.ts

import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { generateSimpleResponse } from './geminiService';
import { checkBackendHealth, sendToBackend } from './api';

// --- THE BIG 4 EXPERTS (Local Fallbacks) ---
import { financeExpert } from './agents/financeAgent';
import { legalExpert } from './agents/legalAgent';
import { securityExpert } from './agents/securityAgent';
import { marinaExpert } from './agents/marinaAgent';
import { technicExpert } from './agents/technicAgent';
import { systemUpdateExpert } from './skills/systemUpdater';

import { VESSEL_KEYWORDS } from './constants';

// Helper
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
        let responseText = "";
        
        // --- 0. HYPERSCALE CHECK (The Hybrid Bridge) ---
        // First, check if the Python Brain (LangGraph) is online.
        const isBackendOnline = await checkBackendHealth();

        if (isBackendOnline) {
            traces.push(createLog('ada.stargate', 'ROUTING', `Hyperscale Link: ACTIVE. Routing to Python Brain (LangGraph)...`, 'ORCHESTRATOR'));
            
            try {
                // Delegate the entire thinking process to the Python Backend
                // This allows for RAG (Qdrant), Math (Python), and Complex Reasoning (LangGraph)
                const backendResponse = await sendToBackend(prompt, user, {
                    vessels_in_port: vesselsInPort,
                    active_tenant: activeTenantConfig.id,
                    user_context: {
                        name: user.name,
                        role: user.role,
                        legal_status: user.legalStatus
                    }
                });

                if (backendResponse) {
                    // Map Backend Traces to Frontend UI for "Glass Box" observability
                    if (backendResponse.traces) {
                        backendResponse.traces.forEach((t: any) => {
                            traces.push(createLog(t.node || 'ada.core', t.step || 'THINKING', t.content, 'EXPERT'));
                        });
                    }
                    
                    // Map Backend Actions (e.g. database updates)
                    if (backendResponse.actions) {
                        actions.push(...backendResponse.actions);
                    }

                    return {
                        text: backendResponse.text,
                        actions: actions,
                        traces: traces
                    };
                }
            } catch (err) {
                console.error("Backend Handover Failed:", err);
                traces.push(createLog('ada.stargate', 'ERROR', `Hyperscale Link Failed. Reverting to Local Edge Logic.`, 'ORCHESTRATOR'));
                // Fallthrough to local logic...
            }
        } else {
            traces.push(createLog('ada.stargate', 'ROUTING', `Hyperscale Link: OFFLINE. Using Local Edge Logic (Browser-Based).`, 'ORCHESTRATOR'));
        }

        // --- LOCAL FALLBACK LOGIC (The Original Orchestrator) ---
        // This code runs if Docker backend is down or unreachable (Offline Mode)
        
        const lower = prompt.toLowerCase();
        
        // Context Extraction
        const findVesselInPrompt = (p: string) => VESSEL_KEYWORDS.find(v => p.toLowerCase().includes(v));
        const vesselName = findVesselInPrompt(prompt) || (user.role === 'CAPTAIN' ? 'S/Y Phisedelia' : 's/y phisedelia');

        // --- 1. ROUTING LAYER (The Big 4 Classifier) ---
        let routedDomain: 'LEGAL' | 'MARINA' | 'FINANCE' | 'STARGATE' = 'STARGATE';

        if (lower.includes('mayday') || lower.includes('fire') || lower.includes('yangın') || lower.includes('kural') || lower.includes('law') || lower.includes('contract') || lower.includes('sözleşme') || lower.includes('security') || lower.includes('patrol')) {
            routedDomain = 'LEGAL';
        } else if (lower.includes('berth') || lower.includes('yanaş') || lower.includes('depart') || lower.includes('ayrıl') || lower.includes('hail') || lower.includes('radar') || lower.includes('technical') || lower.includes('repair') || lower.includes('waste') || lower.includes('mavi kart')) {
            routedDomain = 'MARINA';
        } else if (lower.includes('invoice') || lower.includes('fatura') || lower.includes('debt') || lower.includes('borç') || lower.includes('pay') || lower.includes('öde') || lower.includes('price') || lower.includes('fiyat')) {
            routedDomain = 'FINANCE';
        } else if (lower.includes('system') || lower.includes('update') || lower.includes('federation') || lower.includes('network') || lower.includes('connect')) {
            routedDomain = 'STARGATE';
        }

        traces.push(createLog('ada.stargate', 'ROUTING', `Tenant: ${activeTenantConfig.id} | Intent Classification: ${routedDomain}`, 'ORCHESTRATOR'));

        // --- 2. EXECUTION LAYER ---

        switch (routedDomain) {
            case 'LEGAL':
                // Sub-routing for Legal
                if (lower.includes('mayday') || lower.includes('fire') || lower.includes('code red')) {
                    // Guardian Protocol
                    traces.push(createLog('ada.legal', 'TOOL_EXECUTION', 'Activating GUARDIAN PROTOCOL (Safety First).', 'WORKER'));
                    responseText = "**MAYDAY RELAY RECEIVED.**\n\n**GUARDIAN PROTOCOL ACTIVE.**\n\n> All stations maintain radio silence.\n> Emergency Services dispatched to Sector Alpha.\n> Casualty tracking initiated.";
                    actions.push({ id: `alert_${Date.now()}`, kind: 'internal', name: 'ui.setAlertMode', params: { level: 'RED' } });
                } else if (lower.includes('security') || lower.includes('patrol')) {
                    // Security Ops
                    const secStatus = await securityExpert.dispatchGuard('Sector A', 'ROUTINE', (t) => traces.push(t));
                    responseText = "Security protocol initiated. Patrol dispatched.";
                    actions.push(...secStatus);
                } else {
                    // General Legal/Contract Query (Client-Side RAG)
                    const legalRes = await legalExpert.process({ query: prompt }, user, (t) => traces.push(t));
                    responseText = legalRes[0]?.params?.advice || "Legal advisory generated.";
                }
                break;

            case 'MARINA':
                // Sub-routing for Marina
                if (lower.includes('depart') || lower.includes('ayrıl')) {
                    const depRes = await marinaExpert.processDeparture(vesselName, tenders, (t) => traces.push(t));
                    responseText = depRes.message;
                    if(depRes.actions) actions.push(...depRes.actions);
                } else if (lower.includes('arrive') || lower.includes('geliyor') || lower.includes('hail')) {
                    const arrRes = await marinaExpert.processArrival(vesselName, tenders, { status: 'CLEAR', amount: 0 }, (t) => traces.push(t));
                    responseText = arrRes.message;
                    if(arrRes.actions) actions.push(...arrRes.actions);
                } else if (lower.includes('tech') || lower.includes('repair')) {
                    const techRes = await technicExpert.scheduleService(vesselName, 'GENERAL_REPAIR', 'Tomorrow', (t) => traces.push(t));
                    responseText = techRes.message;
                } else if (lower.includes('waste') || lower.includes('mavi kart')) {
                    const envRes = await technicExpert.processBlueCard(vesselName, 'Pump-out Stn 1', 150, (t) => traces.push(t));
                    responseText = envRes.message;
                } else {
                    // Default Marina Logic via Gemini with specific Tenant Context
                    responseText = await generateSimpleResponse(prompt, user, registry, tenders, vesselsInPort, messages, activeTenantConfig);
                }
                break;

            case 'FINANCE':
                // Sub-routing for Finance
                const status = await financeExpert.checkDebt(vesselName);
                if (lower.includes('pay') || lower.includes('öde')) {
                    const finActions = await financeExpert.process({
                        intent: 'create_invoice',
                        vesselName: vesselName,
                        amount: status.amount,
                        serviceType: 'DEBT_SETTLEMENT'
                    }, user, (t) => traces.push(t));
                    actions.push(...finActions);
                    const linkAction = finActions.find(a => a.name === 'ada.finance.paymentLinkGenerated');
                    responseText = `**PAYMENT LINK GENERATED**\n\nSecure link for **€${status.amount}**.\n\n[Pay via Iyzico](${linkAction?.params?.link?.url})`;
                } else {
                    responseText = `**FINANCIAL STATUS: ${vesselName.toUpperCase()}**\n\nBalance: **€${status.amount}**\nStatus: **${status.status}**`;
                }
                break;

            case 'STARGATE':
                // System Ops & Federation
                if (lower.includes('update') || lower.includes('rule') || lower.includes('kural')) {
                    if (user.role !== 'GENERAL_MANAGER') {
                        responseText = "ACCESS DENIED. System Configuration requires GM clearance.";
                    } else {
                        const newVal = prompt.match(/(\d+)/)?.[0] || 'updated_value';
                        await systemUpdateExpert.updateRule('operational_parameter', newVal);
                        responseText = `**SYSTEM UPDATE**\n\nParameter updated to **${newVal}**. SEAL Protocol active.`;
                        traces.push(createLog('ada.stargate', 'TOOL_EXECUTION', `Patching system config for ${activeTenantConfig.id}...`, 'WORKER'));
                    }
                } else {
                    // Fallback to LLM for general chat
                    responseText = await generateSimpleResponse(prompt, user, registry, tenders, vesselsInPort, messages, activeTenantConfig);
                }
                break;
        }
        
        return { text: responseText, actions: actions, traces: traces };
    }
};
