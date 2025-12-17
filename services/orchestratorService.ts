
import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
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
     * PROCESS REQUEST v2.0 (HYPERSCALE BRIDGE)
     * This function no longer contains business logic. It acts as a secure bridge,
     * forwarding the user's prompt and the full operational context to the 
     * Python backend where the LangGraph brain resides.
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
        
        const traces: AgentTraceLog[] = [createLog('ada.stargate', 'ROUTING', `[EDGE] Request received. Transmitting to Hyperscale Core...`, 'ORCHESTRATOR')];

        // Package the entire current state for the backend brain
        const context = {
            user_profile: user,
            active_tenant: activeTenantConfig,
            marina_state: {
                vessels_in_port: vesselsInPort,
                pending_movements: registry.length,
                active_tenders: tenders.filter(t => t.status === 'Busy').length
            },
            chat_history: messages.slice(-5) // Send last 5 messages for context
        };

        try {
            const backendResponse = await sendToBackend(prompt, user, context);

            if (backendResponse) {
                traces.push(createLog('ada.stargate', 'OUTPUT', `[CORE] Response received from Python Backend.`, 'ORCHESTRATOR'));
                return {
                    text: backendResponse.text || "An unexpected error occurred in the backend.",
                    actions: backendResponse.actions || [],
                    // Combine traces from backend and frontend
                    traces: [...traces, ...(backendResponse.traces || [])]
                };
            }

            // Fallback if backend is unreachable
            throw new Error("Backend communication failed, response was null.");

        } catch (error) {
            console.error("Orchestrator to Backend failed:", error);
            const errorTrace = createLog('ada.stargate', 'CRITICAL', 'Neural link to Hyperscale Core is unstable. Operating in limited Edge mode.', 'ORCHESTRATOR');
            return {
                text: "⚠️ **SYSTEM ALERT**\n\nAna beyinle bağlantı kurulamadı. Sistem, sınırlı yeteneklerle (Dağ Modu) çalışıyor.\n\nLütfen sistem yöneticisi ile görüşün.",
                actions: [],
                traces: [...traces, errorTrace]
            };
        }
    }
};
