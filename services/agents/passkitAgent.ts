
import { AgentAction, AgentTraceLog, UserProfile, NodeName } from '../../types';
import { wimMasterData } from '../wimMasterData';

// Helper to create a log
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const passkitExpert = {
    // Skill: Issue Digital Pass (Marina Access)
    issuePass: async (vesselName: string, ownerName: string, type: 'GUEST' | 'OWNER' | 'CREW', addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, passUrl?: string, qrCode?: string, message: string }> => {
        
        addTrace(createLog('ada.passkit', 'THINKING', `Request to issue ${type} PASS for ${vesselName} (${ownerName}). Verifying credentials...`, 'EXPERT'));

        // 1. Simulated Security Check
        if (type === 'OWNER') {
             addTrace(createLog('ada.passkit', 'TOOL_EXECUTION', `Querying Biometric Database... Match Confirmed.`, 'WORKER'));
        }

        // 2. Generate Token
        const passId = `PK-${Math.floor(Math.random() * 100000)}`;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (type === 'GUEST' ? 1 : 365));
        
        const passData = {
            id: passId,
            holder: ownerName,
            vessel: vesselName,
            accessLevel: type === 'OWNER' ? 'ALL_AREAS' : 'PONTOON_ONLY',
            validUntil: expiry.toISOString().split('T')[0]
        };

        addTrace(createLog('ada.passkit', 'CODE_OUTPUT', `Pass Token Generated: ${JSON.stringify(passData)}`, 'WORKER'));

        // 3. "Sign" the pass (Simulation)
        // In a real scenario, this URL would point to your backend which holds the Apple Certs
        const passUrl = `https://wallet.ada.network/wim/p/${passId}`;
        
        addTrace(createLog('ada.passkit', 'OUTPUT', `Digital Key generated via Ada Secure Enclave. Push notification sent.`, 'EXPERT'));

        return {
            success: true,
            passUrl: passUrl,
            qrCode: "QR_DATA_SIMULATION",
            message: `${type} Pass (${passId}) issued for ${ownerName}. Valid until ${passData.validUntil}.`
        };
    },

    // NEW SKILL: Issue Travel Confirmation Pass (Kites Travel Integration)
    issueTravelPass: async (details: { passenger: string, type: 'FLIGHT' | 'HOTEL' | 'TRANSFER', summary: string, date: string }, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, passUrl: string }> => {
        addTrace(createLog('ada.passkit', 'THINKING', `Generating Digital Travel Document for KITES TRAVEL...`, 'EXPERT'));

        const passId = `KITES-${Math.floor(Math.random() * 100000)}`;
        
        // Simulate PKPass generation structure
        const pkPass = {
            organizationName: "Ada Digital Identity", // UPDATED: More prestigious, tech-oriented name
            description: details.summary,
            logoText: "WIM | Kites", // THE CLIENT BRAND
            foregroundColor: "rgb(255, 255, 255)",
            backgroundColor: "rgb(79, 70, 229)", // Indigo
            serialNumber: passId,
            barcode: {
                message: passId,
                format: "PKBarcodeFormatQR",
                messageEncoding: "iso-8859-1"
            }
        };

        addTrace(createLog('ada.passkit', 'TOOL_EXECUTION', `Signing PKPass bundle (${pkPass.serialNumber}) with Ada Root Certificate...`, 'WORKER'));
        
        const passUrl = `https://wallet.kites.travel/pass/${passId}`;
        
        addTrace(createLog('ada.passkit', 'OUTPUT', `Travel Pass ready. Delivered to client wallet.`, 'EXPERT'));

        return { success: true, passUrl };
    },

    // NEW SKILL: Send Registration Link (Pre-Arrival)
    sendRegistrationLink: async (contact: string, vesselName: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, actions: AgentAction[] }> => {
        addTrace(createLog('ada.passkit', 'THINKING', `Generating secure KYC link for ${vesselName}...`, 'EXPERT'));
        
        const link = `https://ada.passkit.wim/register?ref=${Date.now()}`;
        
        addTrace(createLog('ada.passkit', 'TOOL_EXECUTION', `Dispatching SMS/Email to ${contact || 'Client Phone'}...`, 'WORKER'));
        addTrace(createLog('ada.passkit', 'OUTPUT', `Link Sent: ${link}`, 'EXPERT'));

        return {
            success: true,
            message: "Link sent.",
            actions: [
                {
                    id: `pk_link_${Date.now()}`,
                    kind: 'internal',
                    name: 'ada.marina.log_operation',
                    params: { message: `[PASSKIT] KYC LINK SENT -> ${vesselName}`, type: 'info' }
                }
            ]
        };
    }
};
