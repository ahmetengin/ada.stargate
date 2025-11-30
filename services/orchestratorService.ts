// services/orchestratorService.ts

import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { checkBackendHealth, sendToBackend } from './api';
import { getCurrentMaritimeTime } from './utils';
import { generateSimpleResponse } from './geminiService';
import { MAX_HISTORY_LENGTH } from './geminiService';

// --- LEGACY IMPORTS (FALLBACK MODE) ---
import { financeExpert } from './agents/financeAgent';
import { legalExpert } from './agents/legalAgent';
import { marinaExpert } from './agents/marinaAgent';
import { customerExpert } from './agents/customerAgent';
import { technicExpert } from './agents/technicAgent';
import { federationExpert } from './agents/federationAgent';
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
        
        // 1. Check Python Brain Health
        const isBackendOnline = await checkBackendHealth();

        if (isBackendOnline) {
            traces.push(createLog('ada.stargate', 'ROUTING', `Connected to Hyperscale Brain (Python/LangGraph).`, 'ORCHESTRATOR'));
            
            try {
                // Construct the rich context from the Repo's actual state
                const richContext = {
                    user_id: user.id,
                    user_role: user.role,
                    tenant_id: activeTenantConfig.id,
                    marina_state: {
                        occupancy: vesselsInPort,
                        traffic_load: registry.length,
                        active_tenders: tenders.filter(t => t.status !== 'Idle').length
                    },
                    // Send last few messages for conversational continuity
                    recent_history: messages.slice(-3).map(m => ({ role: m.role, content: m.text }))
                };

                const backendResponse = await sendToBackend(prompt, user, richContext);
                
                if (backendResponse && backendResponse.text) {
                    const actions = backendResponse.actions || [];
                    
                    // Transform backend traces if available, or create a summary trace
                    if (backendResponse.traces && backendResponse.traces.length > 0) {
                        traces.push(...backendResponse.traces);
                    } else {
                        traces.push(createLog('ada.core', 'OUTPUT', `Cognitive processing complete.`, 'EXPERT'));
                    }
                    
                    return { text: backendResponse.text, actions: actions, traces: traces };
                }
            } catch (err) {
                console.error("Backend Error, falling back to local simulation:", err);
                traces.push(createLog('ada.stargate', 'ERROR', `Brain Unreachable. Switching to Local Fallback Protocols.`, 'ORCHESTRATOR'));
            }
        } else {
            traces.push(createLog('ada.stargate', 'ROUTING', `Brain Offline. Using Local Logic (v3.2).`, 'ORCHESTRATOR'));
        }

        // --- FALLBACK LOGIC (Existing Typescript Agents) ---
        const actions: AgentAction[] = [];
        let responseText = "";
        const lower = prompt.toLowerCase();
        const findVesselInPrompt = (p: string) => VESSEL_KEYWORDS.find(v => p.toLowerCase().includes(v));
        const vesselName = findVesselInPrompt(prompt) || (user.role === 'CAPTAIN' ? 'S/Y Phisedelia' : 's/y phisedelia');

        // Existing heuristic logic...
        if (lower.includes('öde') || lower.includes('pay') || lower.includes('link')) {
             if (user.role === 'GUEST') {
                 responseText = "**ACCESS DENIED.** Only registered Captains or Owners can settle vessel accounts.";
             } else {
                 traces.push(createLog('ada.finance', 'PLANNING', `User requested payment link. Initiating transaction protocol...`, 'EXPERT'));
                 const status = await financeExpert.checkDebt(vesselName);
                 if (status.status === 'DEBT') {
                     const finActions = await financeExpert.process({
                         intent: 'create_invoice',
                         vesselName: vesselName,
                         amount: status.amount,
                         serviceType: 'DEBT_SETTLEMENT'
                     }, user, (t) => traces.push(t));
                     actions.push(...finActions);
                     const linkAction = finActions.find(a => a.name === 'ada.finance.paymentLinkGenerated');
                     const linkUrl = linkAction?.params?.link?.url || '#';
                     responseText = `**PAYMENT LINK GENERATED**\n\nI have generated a secure link for your outstanding balance of **€${status.amount}**.\n\n[Click here to Pay via Iyzico 3D-Secure](${linkUrl})\n\n> *Reference: ${vesselName} Debt Settlement*`;
                 } else {
                     responseText = "**ACCOUNT CLEAR.**\n\nYou have no outstanding balance to pay at this time. Thank you.";
                 }
             }
        }
        else if (lower.includes('depart') || lower.includes('leaving') || lower.includes('çıkış')) {
             traces.push(createLog('ada.marina', 'ROUTING', `Departure request detected. Initiating Multi-Agent Consensus Protocol...`, 'ORCHESTRATOR'));
             const debtStatus = await financeExpert.checkDebt(vesselName);
             const financeDecision = debtStatus.status === 'CLEAR' ? 'APPROVE' : 'DENY';
             traces.push(createLog('ada.finance', 'VOTING', `Vote: ${financeDecision}. Reason: ${financeDecision === 'APPROVE' ? 'Account Clear' : 'Outstanding Debt'}`, 'EXPERT'));
             
             // Check Blue Card
             const blueCard = await technicExpert.checkBlueCardStatus(vesselName, (t) => traces.push(t));
             
             if (financeDecision === 'DENY') {
                 responseText = `**DEPARTURE DENIED**\n\nConsensus failed. Outstanding Debt: **€${debtStatus.amount}**.\n\n> **Legal Hold:** Right of Retention exercised pursuant to **WIM Contract Article H.2**.\nPlease clear balance at Finance Office.`;
             } else {
                 const res = await marinaExpert.processDeparture(vesselName, tenders, t => traces.push(t));
                 responseText = res.message;
                 if (blueCard.status === 'EXPIRED') {
                     responseText += `\n\n⚠️ **ENVIRONMENTAL ALERT:** Blue Card expired. Please discharge waste at next port to avoid fines.`;
                 }
                 if (res.actions) actions.push(...res.actions);
             }
        }
        else {
            // General Fallback to Gemini
            traces.push(createLog('ada.stargate', 'THINKING', `No deterministic handler matched. Forwarding to General Intelligence...`, 'ORCHESTRATOR'));
            responseText = await generateSimpleResponse(prompt, user, registry, tenders, vesselsInPort, messages, activeTenantConfig); 
        }
        
        return { text: responseText, actions: actions, traces: traces };
    }
};
