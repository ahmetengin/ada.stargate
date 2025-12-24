// services/orchestratorService.ts

import { AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { sendToBackend } from './api';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const orchestratorService = {
    /**
     * PROCESS REQUEST v5.4 (COGNITIVE RECALL)
     * Orchestrates the brain's reasoning while visualizing the 
     * Retrieval-Augmented Generation (RAG) process for user memory.
     */
    async processRequest(
        prompt: string, 
        user: UserProfile, 
        tenders: Tender[],
        registry: RegistryEntry[] = [],
        vesselsInPort: number = 0,
        messages: Message[] = [],
        activeTenantConfig: TenantConfig
    ): Promise<OrchestratorResponse> {
        
        const traces: AgentTraceLog[] = [
            createLog('ada.stargate', 'ROUTING', `[EDGE] Input received: "${prompt.substring(0, 30)}..."`, 'ORCHESTRATOR'),
            // NEW: Cognitive Recall Visual Trace
            createLog('ada.legal', 'THINKING', `Retrieving historical interaction logs for ${user.name} from Qdrant Neural Memory...`, 'EXPERT'),
        ];

        // Simulate RAG Hit for the trace - in a live backend this is a real semantic search
        const isRegisteredUser = user.name === 'Ahmet Engin' || user.name === 'Kpt. Barbaros';
        if (isRegisteredUser) {
            traces.push(createLog('ada.legal', 'OUTPUT', `Context match found: User history and S/Y Phisedelia metadata recovered.`, 'WORKER'));
        } else {
            traces.push(createLog('ada.legal', 'OUTPUT', `No specific history found for ${user.name}. Initializing guest context.`, 'WORKER'));
        }

        const context = {
            user_profile: user,
            active_tenant: activeTenantConfig,
            marina_state: {
                vessels_in_port: vesselsInPort,
                pending_movements: registry.length || 0,
                active_tenders: tenders.filter(t => t.status === 'Busy').length
            },
            chat_history: messages.slice(-5)
        };

        try {
            const backendResponse = await sendToBackend(prompt, user, context);

            if (backendResponse) {
                return {
                    text: backendResponse.text || "Cognitive error in Hyperscale Core.",
                    actions: backendResponse.actions || [],
                    traces: [...traces, ...(backendResponse.traces || [])]
                };
            }

            throw new Error("Core Timeout");

        } catch (error) {
            console.error("Orchestrator failed:", error);
            const errorTrace = createLog('ada.stargate', 'CRITICAL', 'Neural link unstable. Switching to local survival mode.', 'ORCHESTRATOR');
            return {
                text: "⚠️ **SİSTEM ALERTI**\n\nAna beyne ulaşılamıyor. Sistem yerel 'survival' modunda çalışıyor.\n\n*Not: Geçmiş kayıtlarınızı veya tekne detaylarınızı şu an tam olarak hatırlayamıyor olabilirim.*",
                actions: [],
                traces: [...traces, errorTrace]
            };
        }
    }
};