
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../types';
import { GoogleGenAI } from "@google/genai";
import { marinaExpert } from './agents/marinaAgent';
import { financeExpert } from './agents/financeAgent';
import { systemExpert } from './agents/systemAgent';

const createLocalClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to simulate processing time
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
    
    // 1. ACKNOWLEDGEMENT
    onTrace(createLog('ada.stargate', 'ROUTING', `Signal Received: "${prompt}"`, 'ORCHESTRATOR'));

    // 2. INTENT ANALYSIS (Simulated Semantic Router)
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
    } else if (lowerPrompt.includes('weather') || lowerPrompt.includes('hava') || lowerPrompt.includes('rüzgar')) {
        domain = 'MARINA';
        subNode = 'ada.weather';
    } else if (lowerPrompt.includes('update') || lowerPrompt.includes('rule') || lowerPrompt.includes('limit')) {
        domain = 'STARGATE';
        subNode = 'ada.system';
    }

    onTrace(createLog('ada.router', 'ROUTING', `Intent Classified: [${domain}] -> Routing to ${subNode}`, 'ORCHESTRATOR'));

    // 3. EXECUTION SIMULATION (The "Thinking" Phase)
    await sleep(600);

    if (domain === 'MARINA') {
        onTrace(createLog('ada.marina', 'THINKING', `Analyzing operational context for ${stats.vessels} vessels...`, 'EXPERT'));
        await sleep(500);
        onTrace(createLog('ada.sea', 'TOOL_EXECUTION', `AIS Radar Scan: Sector Zulu Clear. Visibility: Good.`, 'WORKER'));
        onTrace(createLog('ada.weather', 'TOOL_EXECUTION', `MetOcean Data: Wind NW 12kn. Sea State: Slight.`, 'WORKER'));
    } 
    else if (domain === 'FINANCE') {
        onTrace(createLog('ada.finance', 'THINKING', `Accessing Ledger (Parasut API)...`, 'EXPERT'));
        await sleep(500);
        onTrace(createLog('ada.audit', 'TOOL_EXECUTION', `Compliance Check: VAT Rate 20%. No outstanding blocks.`, 'WORKER'));
    }
    else if (domain === 'LEGAL') {
        onTrace(createLog('ada.legal', 'THINKING', `Querying Vector Memory (RAG) for WIM Regulations...`, 'EXPERT'));
        await sleep(500);
        onTrace(createLog('ada.security', 'TOOL_EXECUTION', `ISPS Status: Level 1. Perimeter Secure.`, 'WORKER'));
    }
    else if (domain === 'STARGATE') {
        onTrace(createLog('ada.stargate', 'THINKING', `System Configuration Protocol Initiated.`, 'EXPERT'));
        if (lowerPrompt.includes('speed')) {
             onTrace(createLog('ada.seal', 'SEAL_LEARNING', `Learning new constraint: Speed Limit parameter update requested.`, 'EXPERT'));
        }
    }

    // 4. GENERATION (Edge Fallback)
    onTrace(createLog(subNode, 'THINKING', `Synthesizing final response...`, 'EXPERT'));
    await sleep(600);

    try {
        const ai = createLocalClient();
        const model = 'gemini-2.0-flash-lite-preview-02-05'; 
        
        const systemPrompt = `You are Ada, the Cognitive Operating System for ${tenant.name}.
        Current Context:
        - User: ${user.name} (${user.role})
        - Domain: ${domain}
        - Operational Status: Normal
        
        Be concise, professional, and act as the Marina Control.`;

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] }
            ]
        });

        // FIX: In @google/genai SDK, 'result' is the response object, and 'text' is a property getter.
        const responseText = result.text || "No response generated.";
        
        onTrace(createLog('ada.stargate', 'OUTPUT', `Transmission Sent.`, 'ORCHESTRATOR'));
        
        return { text: responseText };

    } catch (localError: any) {
        console.error("Edge Logic Failed:", localError);
        
        onTrace(createLog('ada.stargate', 'ERROR', `Neural Link Unstable: ${localError.message || 'Unknown Error'}`, 'ORCHESTRATOR'));
        
        // Fallback response to ensure UI doesn't hang
        return { 
            text: `**SYSTEM MESSAGE:**\n\nI processed the ${domain} logic, but my language center is currently offline. \n\n*Action logged: ${subNode} acknowledged.*` 
        };
    }
  }
};
