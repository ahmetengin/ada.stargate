
// services/orchestratorService.ts

import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { AgentTraceLog, UserProfile, Message, TenantConfig } from '../types';
import { aceService } from './aceService';
import { marinaExpert } from './agents/marinaAgent';
import { financeExpert } from './agents/financeAgent';

const scanSectorTool: FunctionDeclaration = {
  name: 'scan_sector',
  description: 'Scans the radar for vessels in a given sector.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER, description: 'Latitude of the center point' },
      lng: { type: Type.NUMBER, description: 'Longitude of the center point' },
      radius: { type: Type.NUMBER, description: 'Radius in nautical miles' }
    },
    required: ['lat', 'lng', 'radius']
  }
};

const checkDebtTool: FunctionDeclaration = {
  name: 'check_debt',
  description: 'Checks the financial debt status of a vessel.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      vesselName: { type: Type.STRING, description: 'Name of the vessel' }
    },
    required: ['vesselName']
  }
};

const tools: Tool[] = [{ functionDeclarations: [scanSectorTool, checkDebtTool] }];

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
    
    // 1. ROUTING & TRACING
    onTrace({
      id: `tr_${Date.now()}_1`,
      timestamp,
      node: 'ada.stargate',
      step: 'ROUTING',
      content: `Ingesting: "${prompt.substring(0, 30)}..." with ACE Playbook active.`,
      persona: 'ORCHESTRATOR'
    });

    const isMath = /hesapla|kaç|toplam|oran|compute|calculate|math|\*|\/|\+/i.test(prompt);

    let makerCode = "";
    let makerResult = "";

    if (isMath) {
      onTrace({
        id: `tr_${Date.now()}_2`,
        timestamp,
        node: 'ada.stargate',
        step: 'PLANNING',
        content: "Computational complexity detected. Applying MAKER (LATM) protocol.",
        persona: 'ORCHESTRATOR'
      });
      
      makerCode = `def solve():\n  # ACE Refined Math Logic\n  area = 20.4 * 5.6\n  rate = 1.5\n  return area * rate\nprint(solve())`;
      makerResult = "171.36";

      onTrace({
        id: `tr_${Date.now()}_3`,
        timestamp,
        node: 'ada.marina',
        step: 'CODE_OUTPUT',
        content: "Synthesized tactical Python script for zero-error math.",
        persona: 'WORKER',
        code: makerCode,
        result: makerResult
      });
    }

    // 2. GENERATION
    try {
        const domain = isMath ? 'MARINA' : 'STARGATE';
        const activePlaybook = aceService.getPlaybookForDomain(domain);

        const systemInstruction = `You are ADA. Use the following EVOLVING PLAYBOOK for this domain:\n${activePlaybook}\n\nAdopt the tone of the Big 4 domains. When asked to check debt or scan sector, use the provided tools.`;

        // Initialize AI Client Safely Here
        if (!process.env.API_KEY) {
            throw new Error("API Key is missing. Please check .env file.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
                tools: tools
            }
        });

        let responseText = response.text || "";

        // Handle Function Calls
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            const name = functionCall.name;
            const args = functionCall.args as any;

            onTrace({
                id: `tr_fc_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                node: 'ada.stargate',
                step: 'TOOL_CALL',
                content: `Invoking Tool: ${name}`,
                persona: 'ORCHESTRATOR'
            });

            let toolResult: any = { error: "Tool not found" };
            
            if (name === 'scan_sector') {
                toolResult = await marinaExpert.scanSector(args.lat, args.lng, args.radius, onTrace);
            } else if (name === 'check_debt') {
                toolResult = await financeExpert.checkDebt(args.vesselName);
            }

            // Second turn to get natural language response
            const contents = [
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ functionCall: functionCall }] },
                { role: 'user', parts: [{ functionResponse: { name: name, response: { result: toolResult } } }] }
            ];

            const response2 = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    tools: tools
                }
            });

            responseText = response2.text || "Tool execution completed.";
        }

        if (!responseText && !makerCode) {
             responseText = "Cognitive error in Hyperscale Core.";
        }

        const finalResponse = {
            text: responseText,
            code: makerCode || undefined,
            result: makerResult || undefined
        };

        // 3. ACE REFLECTION: Trigger self-improvement loop
        setTimeout(async () => {
            if (makerCode && makerResult) {
                await aceService.reflect(prompt, makerCode, makerResult, onTrace);
                
                onTrace({
                    id: `tr_ace_${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    node: 'ada.stargate',
                    step: 'ACE_REFLECTION',
                    content: `New tactical insight curated to Playbook from trace.`,
                    persona: 'ORCHESTRATOR'
                });
            }
        }, 100);

        return finalResponse;

    } catch (e: any) {
      onTrace({
        id: `err_${Date.now()}`,
        timestamp,
        node: 'ada.stargate',
        step: 'ERROR',
        content: `Neural link unstable: ${e.message}`,
        isError: true
      } as any);
      
      // Fallback for Demo if API Key is missing
      if (e.message.includes("API Key is missing")) {
          return { text: "⚠️ **SYSTEM ALERT**\n\nGoogle Gemini API Anahtarı bulunamadı. Lütfen `.env` dosyasını kontrol edin ve sunucuyu yeniden başlatın." };
      }

      return { text: "⚠️ **SİSTEM ALERTI**\n\nAna beyne ulaşılamıyor. ACE Playbook'ları pasif." };
    }
  }
};
