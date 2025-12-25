
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../types';
import { sendToBackend } from './api';
import { marinaExpert } from './agents/marinaAgent';
import { GoogleGenAI } from "@google/genai";

const createLocalClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const orchestratorService = {
  async processRequest(
    prompt: string,
    user: UserProfile,
    history: Message[],
    tenant: TenantConfig,
    stats: any,
    onTrace: (t: AgentTraceLog) => void
  ): Promise<{ text: string; code?: string; result?: string }> {
    const timestamp = new Date().toLocaleTimeString();
    
    // 1. ROUTING LOG
    onTrace({
      id: `tr_${Date.now()}_start`,
      timestamp,
      node: 'ada.stargate',
      step: 'ROUTING',
      content: `Inbound Signal: "${prompt.substring(0, 50)}..."`,
      persona: 'ORCHESTRATOR'
    });

    let backendResponse = null;

    // --- STRATEGY A: HYPERSCALE BACKEND (Python) ---
    try {
        // Attempt to connect to the Python Brain
        backendResponse = await sendToBackend(prompt, user, { stats, history: history.slice(-2) });
    } catch (e) {
        console.warn("Backend connection failed, preparing fallback...", e);
    }

    // If Backend Responded Successfully
    if (backendResponse && backendResponse.text) {
        onTrace({
            id: `tr_${Date.now()}_be`,
            timestamp,
            node: 'ada.core [Python]',
            step: 'OUTPUT',
            content: "Hyperscale Core processed the request.",
            persona: 'ORCHESTRATOR'
        });
        
        // Visualize Backend Traces if available
        if (backendResponse.traces) {
            backendResponse.traces.forEach((t: any, i: number) => {
                onTrace({
                    id: `be_tr_${Date.now()}_${i}`,
                    timestamp: new Date().toLocaleTimeString(),
                    node: t.node || 'ada.core',
                    step: t.step || 'THINKING',
                    content: t.content || JSON.stringify(t),
                    persona: 'EXPERT'
                });
            });
        }

        return {
            text: backendResponse.text,
            // Map legacy fields if needed, or rely on text response
            code: backendResponse.actions?.[0]?.params?.code,
            result: backendResponse.actions?.[0]?.params?.result
        };
    }

    // --- STRATEGY B: EDGE FALLBACK (Browser LLM) ---
    // If we are here, Backend failed or is offline. Ada takes over locally.
    onTrace({
        id: `tr_${Date.now()}_fb`,
        timestamp,
        node: 'ada.stargate [Edge]',
        step: 'WARNING',
        content: "Neural Uplink Unstable (Backend Offline). Switching to Local Logic (Edge Mode).",
        persona: 'ORCHESTRATOR'
    });

    try {
        const ai = createLocalClient();
        // Use Flash model for speed in fallback mode
        const model = 'gemini-2.0-flash-lite-preview-02-05'; 
        
        // Define simple tools for local execution
        const tools = [
            { functionDeclarations: [
                {
                    name: "get_vessel_telemetry",
                    description: "Get battery, fuel, and system status for a vessel.",
                    parameters: { type: "OBJECT", properties: { vesselName: { type: "STRING" } } }
                }
            ]}
        ];

        const systemPrompt = `You are Ada, the Maritime AI for ${tenant.name}.
        The primary brain is currently offline, so you are operating in 'Safe Mode'.
        User: ${user.name} (${user.role}).
        Operational Status: ${stats.vessels} vessels in port.
        Be helpful but brief.`;

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nQuery: ${prompt}` }] }
            ],
            config: { tools }
        });

        // Handle Function Calls locally if needed
        const fc = result.functionCalls?.[0];
        if (fc) {
            const args = fc.args as any;
            onTrace({
                id: `tr_${Date.now()}_tool`,
                timestamp,
                node: 'ada.marina [Local]',
                step: 'TOOL_EXECUTION',
                content: `Executing ${fc.name} locally...`,
                persona: 'WORKER'
            });

            if (fc.name === 'get_vessel_telemetry') {
                const tel = await marinaExpert.getVesselTelemetry(args.vesselName || 'Phisedelia');
                return { text: `**TELEMETRY (LOCAL):**\nBattery: ${tel?.battery.serviceBank}V\nFuel: ${tel?.tanks.fuel}%` };
            }
        }

        return { text: result.text || "I am here, but I cannot process that request right now." };

    } catch (localError: any) {
        console.error("Local Fallback Failed:", localError);
        onTrace({
            id: `tr_${Date.now()}_err`,
            timestamp,
            node: 'ada.stargate',
            step: 'ERROR',
            content: `System Failure: ${localError.message}`,
            isError: true
        });
        return { text: "⚠️ **SYSTEM ALERT**\n\nBoth Cloud and Edge nodes are unresponsive. Check your API Key and Network connection." };
    }
  }
};
