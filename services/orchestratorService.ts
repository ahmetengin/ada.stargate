
import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { checkBackendHealth, sendToBackend } from './api';

// Import Local Experts for Fallback
import { hrExpert } from './agents/hrAgent';
import { financeExpert } from './agents/financeAgent';
import { marinaExpert } from './agents/marinaAgent';
import { securityExpert } from './agents/securityAgent';
import { facilityExpert } from './agents/facilityAgent';
import { commercialExpert } from './agents/commercialAgent';
import { customerExpert } from './agents/customerAgent';
import { analyticsExpert } from './agents/analyticsAgent';
import { legalExpert } from './agents/legalAgent';

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
        const lowerPrompt = prompt.toLowerCase();
        
        // --- HYBRID BRAIN CHECK ---
        const isBackendOnline = await checkBackendHealth();

        if (isBackendOnline) {
            traces.push(createLog('ada.stargate', 'ROUTING', `Hybrid Core: ONLINE. Routing to Hyperscale Brain...`, 'ORCHESTRATOR'));
            
            try {
                // Delegate the entire thinking process to the Python Backend (Hybrid Graph)
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
                    if (backendResponse.traces) {
                        backendResponse.traces.forEach((t: any) => {
                            traces.push(createLog(t.node || 'ada.core', t.step || 'THINKING', t.content, 'EXPERT'));
                        });
                    }
                    
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
                traces.push(createLog('ada.stargate', 'ERROR', `Hybrid Link Failed. Falling back to Local Logic.`, 'ORCHESTRATOR'));
            }
        } else {
            traces.push(createLog('ada.stargate', 'WARNING', `Hybrid Core: OFFLINE. Engaging Local Emergency Protocols.`, 'ORCHESTRATOR'));
        }

        // --- LOCAL FALLBACK ROUTER (JAVASCRIPT LOGIC) ---
        // This runs if Backend is offline or fails.
        // It uses simple Keyword Matching instead of LLM Intent Classification.

        const addTrace = (t: AgentTraceLog) => traces.push(t);

        try {
            // 1. HR / STAFF STATUS
            if (lowerPrompt.includes('staff') || lowerPrompt.includes('patrol') || lowerPrompt.includes('security status') || lowerPrompt.includes('shift')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: HR/SECURITY_OPS -> Delegating to ada.hr`, 'ORCHESTRATOR'));
                const result = await hrExpert.trackPatrolStatus(addTrace);
                return { text: result.message, actions, traces };
            }

            // 2. FINANCE / DEBT / BALANCE
            if (lowerPrompt.includes('balance') || lowerPrompt.includes('debt') || lowerPrompt.includes('owe') || lowerPrompt.includes('finance')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: FINANCE -> Delegating to ada.finance`, 'ORCHESTRATOR'));
                
                // Extract vessel name or default to context
                const vesselName = "S/Y Phisedelia"; // Context-aware in full version
                const debtInfo = await financeExpert.checkDebt(vesselName);
                
                let responseText = `**FINANCIAL STATUS: ${vesselName}**\n\n`;
                if (debtInfo.status === 'DEBT') {
                    responseText += `⚠️ **OUTSTANDING BALANCE:** €${debtInfo.amount.toFixed(2)}\n`;
                    responseText += `Status: **${debtInfo.paymentHistoryStatus}**\n\n`;
                    responseText += `Please settle this invoice to clear departure restrictions (Article H.2).`;
                } else {
                    responseText += `✅ **ACCOUNT CLEAR**\nNo outstanding dues. Thank you for your prompt payments.`;
                }
                return { text: responseText, actions, traces };
            }

            // 3. MARINA OPS / ARRIVAL / DEPARTURE
            if (lowerPrompt.includes('arrival') || lowerPrompt.includes('departure') || lowerPrompt.includes('dock') || lowerPrompt.includes('berth')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: MARINA_OPS -> Delegating to ada.marina`, 'ORCHESTRATOR'));
                
                if (lowerPrompt.includes('arrival')) {
                    const result = await marinaExpert.processArrival("S/Y Phisedelia", tenders, { status: 'DEBT', amount: 850 }, addTrace);
                    actions.push(...result.actions);
                    return { text: result.message, actions, traces };
                }
                
                // Default berth check
                const vessel = { loa: 20.4, beam: 5.6, draft: 3.5, type: "VO65 Racing Yacht" };
                const berth = await import('./agents/berthAgent').then(m => m.berthExpert.findOptimalBerth(vessel, addTrace));
                
                return { 
                    text: `**BERTH ALLOCATION**\n\nBased on your vessel specs (${vessel.loa}m x ${vessel.beam}m):\n\n> **Assigned:** ${berth.berth}\n> **Reasoning:** ${berth.reasoning}\n> **Rate:** €${berth.priceQuote}/day`, 
                    actions, 
                    traces 
                };
            }

            // 4. COMMERCIAL / TENANTS
            if (lowerPrompt.includes('shop') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('tenant') || lowerPrompt.includes('commercial')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: COMMERCIAL -> Delegating to ada.commercial`, 'ORCHESTRATOR'));
                const mixAnalysis = await commercialExpert.analyzeRetailMix(addTrace);
                return { text: mixAnalysis, actions, traces };
            }

            // 5. LEGAL / RULES
            if (lowerPrompt.includes('rule') || lowerPrompt.includes('law') || lowerPrompt.includes('contract') || lowerPrompt.includes('sale')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: LEGAL -> Delegating to ada.legal`, 'ORCHESTRATOR'));
                const legalRes = await legalExpert.process({ query: prompt }, user, addTrace);
                const advice = legalRes[0]?.params?.advice || "Consulting legal database...";
                return { text: advice, actions, traces };
            }

            // 6. CUSTOMER / LOYALTY
            if (lowerPrompt.includes('loyalty') || lowerPrompt.includes('points') || lowerPrompt.includes('score')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: CRM -> Delegating to ada.customer`, 'ORCHESTRATOR'));
                const risk = await customerExpert.evaluateCustomerRisk("S/Y Phisedelia", addTrace);
                return { 
                    text: `**CUSTOMER TRUST SCORE (ATS)**\n\n> **Score:** ${risk.totalScore}/1000\n> **Segment:** ${risk.segment}\n\n*Breakdown: Financial(${risk.breakdown.financial}), Operational(${risk.breakdown.operational})*`, 
                    actions, 
                    traces 
                };
            }

            // 7. FACILITY / INFRASTRUCTURE
            if (lowerPrompt.includes('water') || lowerPrompt.includes('electricity') || lowerPrompt.includes('waste') || lowerPrompt.includes('blue card')) {
                traces.push(createLog('ada.stargate', 'ROUTING', `Intent detected: FACILITY -> Delegating to ada.facility`, 'ORCHESTRATOR'));
                
                if (lowerPrompt.includes('blue card')) {
                    const res = await import('./agents/technicAgent').then(m => m.technicExpert.processBlueCard("S/Y Phisedelia", "Fuel Dock", 150, addTrace));
                    actions.push(...res.actions);
                    return { text: res.message, actions, traces };
                }

                const status = await facilityExpert.checkInfrastructureStatus(addTrace);
                return { text: `**INFRASTRUCTURE REPORT**\n\nStatus: **${status.status}**\nAlerts: ${status.alerts.length > 0 ? status.alerts.join(', ') : 'None'}`, actions, traces };
            }

            // 8. GENERAL / CHAT (Fallback)
            // If no specific keyword matches, use the simple Gemini Flash responder from before
            traces.push(createLog('ada.stargate', 'ROUTING', `No specific protocol matched. Routing to LLM Chitchat.`, 'ORCHESTRATOR'));
            return { text: "", actions, traces }; // Returning empty text signals App.tsx to use streamChatResponse

        } catch (error: any) {
            console.error("Local Orchestration Error:", error);
            traces.push(createLog('ada.stargate', 'ERROR', `Local Logic Failure: ${error.message}`, 'ORCHESTRATOR'));
            return {
                text: "⚠️ **SYSTEM ERROR:** Local protocols failed. Please try a simpler command.",
                actions: [],
                traces: traces
            };
        }
    }
};
