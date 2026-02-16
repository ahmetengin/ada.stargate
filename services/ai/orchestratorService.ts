
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../../types';
import { sendToBackend } from '../core/api'; 
import { GoogleGenAI } from "@google/genai";
import { AGENT_REGISTRY } from '../agents/registry';

// --- EDGE CLIENT FACTORY ---
const createLocalClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey.includes("YourActualKey")) {
        throw new Error("MISSING_API_KEY");
    }
    return new GoogleGenAI({ apiKey });
};

// --- LOGGING HELPER ---
const createLog = (node: string, step: any, content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'WORKER'): AgentTraceLog => ({
    id: `tr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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
    
    // 0. Initial Ack
    onTrace(createLog('ada.stargate', 'ROUTING', `Signal Received: "${prompt}"`, 'ORCHESTRATOR'));

    // ---------------------------------------------------------
    // STRATEGY A: BACKEND (Python LangGraph)
    // ---------------------------------------------------------
    try {
        const context = {
            vesselsInPort: stats.vessels || 0,
            tendersActive: stats.tenders || 0,
            weather: "Fair (Mock)",
            user_id: user.id
        };

        // Attempt Backend Call
        const backendResponse = await sendToBackend(prompt, user, context);
        
        if (backendResponse) {
            // Success! Stream backend traces to UI
            if (backendResponse.traces) {
                backendResponse.traces.forEach(t => onTrace(t));
            }
            return { 
                text: backendResponse.text,
                nodePath: 'ADA.CORE (PYTHON)' 
            };
        }
        // If backendResponse is null, it means sendToBackend failed gracefully. Proceed to Strategy B.
    } catch (e) {
        console.error("Backend Strategy Failed:", e);
        // Fallthrough to Edge
    }

    // ---------------------------------------------------------
    // STRATEGY B: EDGE (Browser Gemini)
    // ---------------------------------------------------------
    onTrace(createLog('ada.stargate', 'WARNING', `Backend Uplink Silent. Engaging Edge Cognitive Protocols.`, 'ORCHESTRATOR'));

    const lowerPrompt = prompt.toLowerCase();
    
    // 1. Edge Routing (Heuristic)
    let domain = 'GENERAL';
    let targetNode = 'ada.chat';

    if (lowerPrompt.match(/(fatura|borç|price|euro|cost|payment)/)) {
        domain = 'FINANCE';
        targetNode = 'ada.finance';
    } else if (lowerPrompt.match(/(tekne|berth|traffic|radar|bağlama|yelken)/)) {
        domain = 'MARINA';
        targetNode = 'ada.marina';
    } else if (lowerPrompt.match(/(kural|law|contract|sözleşme|kvkk)/)) {
        domain = 'LEGAL';
        targetNode = 'ada.legal';
    } else if (lowerPrompt.match(/(predict|tahmin|forecast)/)) {
        domain = 'ANALYTICS';
        targetNode = 'ada.analytics';
    }

    onTrace(createLog('ada.router', 'ROUTING', `(EDGE) Intent: [${domain}] -> ${targetNode}`, 'ORCHESTRATOR'));

    // 2. Edge Skill Execution (Simulated Workers)
    try {
        if (domain === 'MARINA' && (lowerPrompt.includes('durum') || lowerPrompt.includes('status'))) {
             // Safe lookup in registry
             if(AGENT_REGISTRY['ada.technic']) {
                await AGENT_REGISTRY['ada.technic'].checkBoatyardCapacity(onTrace);
             }
        }
    } catch (skillErr) {
        console.warn("Edge Skill Error:", skillErr);
    }
    
    // 3. Edge LLM Generation
    try {
        const ai = createLocalClient();
        const model = 'gemini-3-flash-preview'; 
        
        const systemPrompt = `
        You are ADA, the Cognitive Operating System for ${tenant.name}.
        The Python Backend is OFFLINE. You are running in "Edge Mode" (Browser).
        
        Current User: ${user.name} (${user.role})
        Active Node: ${targetNode}
        
        INSTRUCTIONS:
        1. Act as the ${targetNode} agent.
        2. Be concise, professional, and maritime-focused.
        3. Do not hallucinate data. If you need DB access, say "I cannot access the central database in Edge Mode."
        `;

        onTrace(createLog(targetNode, 'THINKING', `(EDGE) Synthesizing via ${model}...`, 'EXPERT'));

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] }
            ]
        });

        const responseText = result.text || "No response generated.";
        
        onTrace(createLog(targetNode, 'OUTPUT', `(EDGE) Response Delivered.`, 'WORKER'));
        
        return { 
            text: responseText,
            nodePath: `ADA.EDGE -> ${targetNode.toUpperCase()}` 
        };

    } catch (localError: any) {
        console.error("Edge Logic Fatal Error:", localError);
        
        let errorMsg = "System Critical: Unable to process request in Core or Edge modes.";
        if (localError.message === "MISSING_API_KEY") {
            errorMsg = "Configuration Error: `API_KEY` is missing in environment variables. Please check .env file.";
        } else if (localError.message?.includes("quota")) {
            errorMsg = "System Alert: Neural API Rate Limit Exceeded.";
        }

        onTrace(createLog('ada.stargate', 'CRITICAL', errorMsg, 'ORCHESTRATOR'));
        return { text: `**SYSTEM FAILURE**\n\n${errorMsg}` };
    }
  }
};
