
// services/orchestratorService.ts

import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { checkBackendHealth, sendToBackend } from './api';
import { getCurrentMaritimeTime } from './utils';
import { generateSimpleResponse } from './geminiService';
import { MAX_HISTORY_LENGTH } from './geminiService';

// --- EXPERT AGENTS ---
import { financeExpert } from './agents/financeAgent';
import { legalExpert } from './agents/legalAgent';
import { marinaExpert } from './agents/marinaAgent';
import { customerExpert } from './agents/customerAgent';
import { technicExpert } from './agents/technicAgent';
import { federationExpert } from './agents/federationAgent';
import { systemUpdateExpert } from './skills/systemUpdater'; // NEW SKILL
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
        
        // 1. Check Python Brain Health (Skip for now to show JS Skills)
        const isBackendOnline = false; // Force Local for Demo

        // --- LOCAL ORCHESTRATION LOGIC ---
        const actions: AgentAction[] = [];
        let responseText = "";
        const lower = prompt.toLowerCase();
        const findVesselInPrompt = (p: string) => VESSEL_KEYWORDS.find(v => p.toLowerCase().includes(v));
        const vesselName = findVesselInPrompt(prompt) || (user.role === 'CAPTAIN' ? 'S/Y Phisedelia' : 's/y phisedelia');

        // --- SKILL: SYSTEM UPDATE (The "Self-Updating" Logic) ---
        if (lower.includes('hız limiti') || lower.includes('speed limit') || lower.includes('kural güncelle') || lower.includes('update rule')) {
            if (user.role !== 'GENERAL_MANAGER') {
                responseText = "ACCESS DENIED. System Configuration requires GM clearance.";
            } else {
                traces.push(createLog('ada.system', 'PLANNING', 'Detected request to modify Operational Rules.', 'EXPERT'));
                
                // Extract value (naive regex)
                const numberMatch = prompt.match(/(\d+)/);
                const newVal = numberMatch ? parseInt(numberMatch[0]) : 5; // Default to 5 if no number
                
                // EXECUTE SKILL
                const updateAction = await systemUpdateExpert.updateRule('speed_limit_knots', newVal);
                actions.push(updateAction);
                
                traces.push(createLog('ada.system', 'TOOL_EXECUTION', `Patching 'marina_wim_rules.yaml' in memory... Value: ${newVal}`, 'WORKER'));
                
                responseText = `**SYSTEM UPDATE CONFIRMED**\n\nOperational Rule 'speed_limit_knots' has been updated to **${newVal} knots**.\n\n> *Protocol:* Immediate Effect.\n> *Broadcast:* All vessels notified via Link 16.`;
            }
        }
        // --- SKILL: ASSET REGISTRATION ---
        else if (lower.includes('yeni bot') || lower.includes('add tender') || lower.includes('register asset')) {
             if (user.role !== 'GENERAL_MANAGER') {
                responseText = "ACCESS DENIED. Asset management restricted.";
             } else {
                traces.push(createLog('ada.system', 'PLANNING', 'New Asset Registration Protocol initiated.', 'EXPERT'));
                const assetName = "Tender Delta (Fast)"; // Mock extraction
                
                // EXECUTE SKILL
                const regAction = await systemUpdateExpert.registerAsset('Patrol Boat', assetName);
                actions.push(regAction);
                
                traces.push(createLog('ada.system', 'CODE_OUTPUT', `Database updated. Asset ID: ${regAction.params.asset.id}`, 'WORKER'));
                responseText = `**ASSET REGISTERED**\n\nUnit **${assetName}** has been added to the active fleet registry.\nStatus: **IDLE**\nAssignment: **READY**`;
             }
        }
        // --- EXISTING LOGIC ---
        else if (lower.includes('öde') || lower.includes('pay') || lower.includes('link')) {
             if (user.role === 'VISITOR') {
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
