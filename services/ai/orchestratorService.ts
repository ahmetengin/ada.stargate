
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../../types';
import { sendToBackend } from '../api'; 
import { GoogleGenAI } from "@google/genai";

const createLocalClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API Key is missing in environment variables!");
        // We will throw here, but it will be caught in processRequest
        throw new Error("API Key Missing");
    }
    return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createLog = (node: string, step: any, content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'WORKER'): AgentTraceLog => ({
    id: `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const orchestratorService = {
  async processRequest(
    prompt: string,
    user: UserProfile,
    history: Message[],
    tenant: TenantConfig,
    stats: any,
    onTrace: (t: AgentTraceLog) => void
  ): Promise<{ text: string; code?: string; result?: string; episodeId?: string; nodePath?: string }> {
    
    // 1. Log Receipt
    onTrace(createLog('ada.stargate', 'ROUTING', `Signal Received: "${prompt}"`, 'ORCHESTRATOR'));

    // 2. Try HYPERSCALE BACKEND First
    let backendResponse = null;
    try {
        const context = {
            vesselsInPort: stats.vessels,
            weather: "WIND_NW_12KN", 
            user_id: user.id
        };

        // Try backend with a short timeout to fail fast to edge logic if offline
        backendResponse = await sendToBackend(prompt, user, context);
    } catch (e) {
        // Silent catch, proceed to fallback
    }

    if (backendResponse) {
        if (backendResponse.traces) {
            backendResponse.traces.forEach(t => onTrace(t));
        }
        return { 
            text: backendResponse.text,
            nodePath: 'ADA.CORE (PYTHON)' 
        };
    }

    // 3. FALLBACK: LOCAL EDGE LOGIC (React/Gemini)
    // Removed long sleep to make UI feel more responsive
    onTrace(createLog('ada.stargate', 'WARNING', `Backend Uplink Offline. Switching to Edge Mode.`, 'ORCHESTRATOR'));

    const lowerPrompt = prompt.toLowerCase();
    let domain = 'GENERAL';
    let subNode = 'ada.chat';

    if (lowerPrompt.includes('fatura') || lowerPrompt.includes('borç') || lowerPrompt.includes('price') || lowerPrompt.includes('cost')) {
        domain = 'FINANCE';
        subNode = 'ada.finance';
    } else if (lowerPrompt.includes('tekne') || lowerPrompt.includes('boat') || lowerPrompt.includes('berth') || lowerPrompt.includes('traffic')) {
        domain = 'MARINA';
        subNode = 'ada.marina';
    } else if (lowerPrompt.includes('kural') || lowerPrompt.includes('law') || lowerPrompt.includes('contract') || lowerPrompt.includes('security')) {
        domain = 'LEGAL';
        subNode = 'ada.legal';
    }

    onTrace(createLog('ada.router', 'ROUTING', `(EDGE) Intent Classified: [${domain}] -> Routing to ${subNode}`, 'ORCHESTRATOR'));

    try {
        const ai = createLocalClient();
        const model = 'gemini-3-flash-preview'; 
        
        const systemPrompt = `You are Ada, the Cognitive Operating System for ${tenant.name}.
        Current Context:
        - User: ${user.name} (${user.role})
        - Domain: ${domain}
        - Operational Status: Edge Fallback Mode (Container System Offline)
        
        Instructions:
        1. Act as the ${domain} expert.
        2. Be concise, professional, and maritime-focused.
        3. Since backend tools are offline, simulate successful responses for demo purposes or provide general information.
        `;

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] }
            ]
        });

        const responseText = result.text || "No response generated.";
        onTrace(createLog(subNode, 'OUTPUT', `(EDGE) Response Generated.`, 'EXPERT'));
        return { text: responseText, nodePath: `ADA.EDGE -> ${subNode.toUpperCase()}` };

    } catch (localError: any) {
        console.error("Edge Logic Error:", localError);
        onTrace(createLog('ada.stargate', 'ERROR', `Edge Processing Failed: ${localError.message || 'Unknown Error'}`, 'ORCHESTRATOR'));
        
        // Return a safe fallback message even if Gemini fails so the UI unblocks
        return { 
            text: `**SYSTEM MESSAGE:**\n\nI am unable to connect to the Cognitive Core. \n\n*Error:* ${localError.message || 'Network/API Failure'}\n*Status:* Offline Mode` 
        };
    }
  }
};
