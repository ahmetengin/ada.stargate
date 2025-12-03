import { AgentAction, AgentTraceLog, UserProfile, OrchestratorResponse, NodeName, Tender, RegistryEntry, Message, TenantConfig } from '../types';
import { getCurrentMaritimeTime } from './utils';
import { checkBackendHealth, sendToBackend } from './api';

// Helper
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const orchestratorService = {
    async processRequest(
        prompt: string, 
        user: UserProfile, 
        tenders: Tender[],
        registry: RegistryEntry[] = [],
        vesselsInPort: number = 0,
        messages: Message[] = [],
        activeTenantConfig: TenantConfig
    ): Promise<OrchestratorResponse> {
        const traces: AgentTraceLog[] = [];
        const actions: AgentAction[] = [];
        
        // --- HYBRID BRAIN CHECK ---
        const isBackendOnline = await checkBackendHealth();

        if (isBackendOnline) {
            traces.push(createLog('ada.stargate', 'ROUTING', `Hybrid Core: ONLINE. Routing to Hyperscale Brain...`, 'ORCHESTRATOR'));
            
            try {
                // Delegate the entire thinking process to the Python Backend (Hybrid Graph)
                const backendResponse = await sendToBackend(prompt, user, {
                    vessels_in_port: vesselsInPort,
                    active_tenant: activeTenantConfig.id,
                    user_context: {
                        name: user.name,
                        role: user.role,
                        legal_status: user.legalStatus
                    }
                });

                if (backendResponse) {
                    if (backendResponse.traces) {
                        backendResponse.traces.forEach((t: any) => {
                            traces.push(createLog(t.node || 'ada.core', t.step || 'THINKING', t.content, 'EXPERT'));
                        });
                    }
                    
                    if (backendResponse.actions) {
                        actions.push(...backendResponse.actions);
                    }

                    return {
                        text: backendResponse.text,
                        actions: actions,
                        traces: traces
                    };
                }
            } catch (err) {
                console.error("Backend Handover Failed:", err);
                traces.push(createLog('ada.stargate', 'ERROR', `Hybrid Link Failed.`, 'ORCHESTRATOR'));
            }
        } else {
            traces.push(createLog('ada.stargate', 'ERROR', `Hybrid Core: OFFLINE. Unable to process complex request.`, 'ORCHESTRATOR'));
            return {
                text: "⚠️ **SYSTEM ALERT:** Core Brain is offline. Please check Docker containers.",
                actions: [],
                traces: traces
            };
        }
        
        return { text: "Error processing request.", actions: [], traces: [] };
    }
};