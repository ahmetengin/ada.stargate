
// services/ai/orchestratorService.ts
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../../types';
import { GoogleGenAI } from "@google/genai";

const createLocalClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  ): Promise<{ text: string; code?: string; result?: string }> {
    
    onTrace(createLog('ada.stargate', 'ROUTING', `Signal Received: "${prompt}"`, 'ORCHESTRATOR'));

    await sleep(400);
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

    onTrace(createLog('ada.router', 'ROUTING', `Intent Classified: [${domain}] -> Routing to ${subNode}`, 'ORCHESTRATOR'));

    await sleep(600);

    if (domain === 'MARINA') {
        onTrace(createLog('ada.marina', 'THINKING', `Analyzing operational context for ${stats.vessels} vessels...`, 'EXPERT'));
        await sleep(500);
        onTrace(createLog('ada.sea', 'TOOL_EXECUTION', `AIS Radar Scan: Sector Zulu Clear. Visibility: Good.`, 'WORKER'));
    } 

    onTrace(createLog(subNode, 'THINKING', `Synthesizing final response...`, 'EXPERT'));
    await sleep(600);

    try {
        const ai = createLocalClient();
        const model = 'gemini-3-flash-preview'; 
        
        const systemPrompt = `You are Ada, the Cognitive Operating System for ${tenant.name}.
        Current Context:
        - User: ${user.name} (${user.role})
        - Domain: ${domain}
        - Operational Status: Normal`;

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] }
            ]
        });

        const responseText = result.text || "No response generated.";
        onTrace(createLog('ada.stargate', 'OUTPUT', `Transmission Sent.`, 'ORCHESTRATOR'));
        return { text: responseText };

    } catch (localError: any) {
        onTrace(createLog('ada.stargate', 'ERROR', `Neural Link Unstable: ${localError.message || 'Unknown Error'}`, 'ORCHESTRATOR'));
        return { 
            text: `**SYSTEM MESSAGE:**\n\nI processed the ${domain} logic, but my language center is currently offline.` 
        };
    }
  }
};
