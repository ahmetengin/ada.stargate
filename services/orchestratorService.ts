
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../types';
import { sendToBackend } from './api';
import { marinaExpert } from './agents/marinaAgent';
import { financeExpert } from './agents/financeAgent';
// Local fallback tools
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

    // --- STRATEGY A: HYPERSCALE BACKEND (Python) ---
    try {
        // We attempt to offload the heavy lifting (LangGraph) to the server
        const backendRes = await sendToBackend(prompt, user, { stats, history: history.slice(-2) });
        
        if (backendRes && backendRes.text) {
            onTrace({
                id: `tr_${Date.now()}_be`,
                timestamp,
                node: 'ada.core [Python]',
                step: 'OUTPUT',
                content: "Hyperscale Core processed the request.",
                persona: 'ORCHESTRATOR'
            });
            
            // Backend might return traces we want to visualize
            if (backendRes.traces) {
                backendRes.traces.forEach((t: any, i: number) => {
                    onTrace({
                        id: `be_tr_${Date.now()}_${i}`,
                        timestamp,
                        node: t.node || 'ada.core',
                        step: t.step || 'THINKING',
                        content: t.content || JSON.stringify(t),
                        persona: 'EXPERT'
                    });
                });
            }

            return {
                text: backendRes.text,
                // If the backend generated code/results, pass them through
                code: backendRes.actions?.[0]?.params?.code,
                result: backendRes.actions?.[0]?.params?.result
            };
        }
    } catch (e) {
        // Silent fail to Strategy B
        console.warn("Backend unavailable, using edge fallback.");
    }

    // --- STRATEGY B: EDGE FALLBACK (Browser LLM) ---
    onTrace({
        id: `tr_${Date.now()}_fb`,
        timestamp,
        node: 'ada.stargate [Edge]',
        step: 'WARNING',
        content: "Neural Uplink Unstable. Switching to Local Logic (Edge Mode).",
        persona: 'ORCHESTRATOR'
    });

    try {
        const ai = createLocalClient();
        const model = 'gemini-3-flash-preview'; // Fast model for edge
        
        // Simple Tool Definitions for Local Fallback
        const tools = [
            { functionDeclarations: [
                {
                    name: "get_vessel_telemetry",
                    description: "Get battery, fuel, and system status.",
                    parameters: { type: "OBJECT", properties: { vesselName: { type: "STRING" } } }
                }
            ]}
        ];

        const result = await ai.models.generateContent({
            model,
            contents: [
                { role: 'user', parts: [{ text: `System Prompt: You are Ada, Marina OS. User: ${user.name}. Query: ${prompt}` }] }
            ],
            config: { tools }
        });

        // Handle Function Calls locally
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

        return { text: result.text || "Communication Error." };

    } catch (localError: any) {
        onTrace({
            id: `tr_${Date.now()}_err`,
            timestamp,
            node: 'ada.stargate',
            step: 'ERROR',
            content: `System Failure: ${localError.message}`,
            isError: true
        });
        return { text: "⚠️ **SYSTEM OFFLINE**\n\nUnable to process request. Please check network connection." };
    }
  }
};
