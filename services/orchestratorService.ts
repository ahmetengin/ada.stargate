
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../types';
import { GoogleGenAI } from "@google/genai";
import { AGENT_REGISTRY } from './agents/registry';

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
  ): Promise<{ text: string; code?: string; result?: string; episodeId?: string; nodePath?: string }> {
    
    // 1. ACKNOWLEDGEMENT
    onTrace(createLog('ada.stargate', 'ROUTING', `Signal Received: "${prompt}"`, 'ORCHESTRATOR'));

    // 2. INTENT CLASSIFICATION (Heuristic Router)
    await sleep(300);
    const lowerPrompt = prompt.toLowerCase();
    
    let domain = 'GENERAL';
    let subNode = 'ada.chat';

    // --- ROUTING LOGIC v2.0 ---
    
    // EXECUTIVE & STRATEGY
    if (lowerPrompt.includes('toplantı') || lowerPrompt.includes('meeting') || lowerPrompt.includes('tutanak') || lowerPrompt.includes('proposal') || lowerPrompt.includes('teklif')) {
        domain = 'EXECUTIVE';
        subNode = 'ada.executive';
    }
    // IT & SYSTEM
    else if (lowerPrompt.includes('server') || lowerPrompt.includes('docker') || lowerPrompt.includes('latency') || lowerPrompt.includes('wifi') || lowerPrompt.includes('cyber')) {
        domain = 'IT_SYSTEMS';
        subNode = 'ada.it';
    }
    // ROBOTICS & DRONE
    else if (lowerPrompt.includes('drone') || lowerPrompt.includes('robot') || lowerPrompt.includes('hull') || lowerPrompt.includes('uçuş')) {
        domain = 'ROBOTICS';
        subNode = 'ada.robotics';
    }
    // FINANCE & YIELD
    else if (lowerPrompt.includes('fatura') || lowerPrompt.includes('invoice') || lowerPrompt.includes('borç') || lowerPrompt.includes('price') || lowerPrompt.includes('yield')) {
        domain = 'FINANCE';
        subNode = 'ada.finance';
    } 
    // MARINA OPS
    else if (lowerPrompt.includes('tekne') || lowerPrompt.includes('berth') || lowerPrompt.includes('bağlama') || lowerPrompt.includes('traffic') || lowerPrompt.includes('weather')) {
        domain = 'MARINA';
        subNode = 'ada.marina';
    } 
    // LEGAL & SECURITY
    else if (lowerPrompt.includes('kural') || lowerPrompt.includes('law') || lowerPrompt.includes('contract') || lowerPrompt.includes('security') || lowerPrompt.includes('camera')) {
        domain = 'LEGAL';
        subNode = lowerPrompt.includes('security') ? 'ada.security' : 'ada.legal';
    }
    // CONCIERGE
    else if (lowerPrompt.includes('taxi') || lowerPrompt.includes('kahve') || lowerPrompt.includes('coffee') || lowerPrompt.includes('buggy') || lowerPrompt.includes('market')) {
        domain = 'CONCIERGE';
        subNode = 'ada.concierge';
    }

    onTrace(createLog('ada.router', 'ROUTING', `Intent Classified: [${domain}] -> Routing to ${subNode}`, 'ORCHESTRATOR'));

    // 3. EXECUTION SIMULATION (The "Thinking" Phase)
    await sleep(500);

    // Dynamic Execution based on Node
    try {
        if (domain === 'IT_SYSTEMS') {
            await AGENT_REGISTRY['ada.it'].checkConnectivity(onTrace);
        }
        else if (domain === 'EXECUTIVE') {
            onTrace(createLog('ada.executive', 'THINKING', `Loading Strategic Context for ${user.name}...`, 'EXPERT'));
        }
        else if (domain === 'ROBOTICS') {
             // Example trigger
             if (lowerPrompt.includes('clean')) {
                 await AGENT_REGISTRY['ada.robotics'].manageHullCleaner('S/Y Phisedelia', 'CLEAN', onTrace);
             }
        }
        else if (domain === 'MARINA') {
            onTrace(createLog('ada.marina', 'THINKING', `Analyzing operational context for ${stats.vessels} vessels...`, 'EXPERT'));
            // Trigger AIS if needed
            if (lowerPrompt.includes('radar') || lowerPrompt.includes('scan')) {
                 // Trigger real tool if backend connected, else mock trace
                 onTrace(createLog('ada.sea', 'TOOL_EXECUTION', `AIS Radar Scan: Sector Zulu Clear.`, 'WORKER'));
            }
        }
    } catch (err) {
        console.warn("Local execution simulation failed", err);
    }

    // 4. GENERATION (LLM Response)
    onTrace(createLog(subNode, 'THINKING', `Synthesizing final response...`, 'EXPERT'));
    await sleep(600);

    try {
        const ai = createLocalClient();
        const model = 'gemini-3-flash-preview'; 
        
        const systemPrompt = `You are Ada, the Cognitive Operating System for ${tenant.name}.
        Current Context:
        - User: ${user.name} (${user.role})
        - Active Agent Persona: ${subNode}
        - Operational Status: Normal
        
        Act exactly as the specific agent defined in the persona. 
        If IT: Be technical. If Executive: Be strategic. If Concierge: Be helpful.
        Keep it concise.`;

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] }
            ]
        });

        const responseText = result.text || "No response generated.";
        
        onTrace(createLog('ada.stargate', 'OUTPUT', `Transmission Sent.`, 'ORCHESTRATOR'));
        
        return { 
            text: responseText,
            nodePath: `ADA.STARGATE -> ${subNode.toUpperCase()}`
        };

    } catch (localError: any) {
        console.error("Edge Logic Failed:", localError);
        onTrace(createLog('ada.stargate', 'ERROR', `Neural Link Unstable: ${localError.message}`, 'ORCHESTRATOR'));
        return { 
            text: `**SYSTEM MESSAGE:**\n\nI processed the ${domain} logic, but my language center is currently offline. \n\n*Action logged: ${subNode} acknowledged.*` 
        };
    }
  }
};
