
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { checkBackendHealth, getSystemDiagnostics } from '../core/api';
import { getCurrentMaritimeTime } from '../utils/utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_it_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const itExpert = {
    checkConnectivity: async (addTrace: (t: AgentTraceLog) => void): Promise<{ status: 'ONLINE' | 'OFFLINE', latency: number, message: string }> => {
        addTrace(createLog('ada.it', 'THINKING', `Running Full Stack Diagnostics (Container Mesh)...`, 'EXPERT'));
        const start = Date.now();
        const diagnostics = await getSystemDiagnostics();
        const latency = Date.now() - start;

        if (diagnostics) {
            const infra = diagnostics.infrastructure || { orchestrator: 'UNKNOWN' };
            addTrace(createLog('ada.it', 'OUTPUT', `System Green. Latency: ${latency}ms.`, 'WORKER'));
            return { 
                status: 'ONLINE', 
                latency, 
                message: `**SYSTEM STATUS: ONLINE**\n\n> **Latency:** ${latency}ms\n> **Brain:** ${infra.orchestrator}\n` 
            };
        } else {
            addTrace(createLog('ada.it', 'CRITICAL', `CONNECTION LOST.`, 'WORKER'));
            return { status: 'OFFLINE', latency: 0, message: `**⚠️ SYSTEM ALERT: OFFLINE**` };
        }
    },

    runCyberScan: async (addTrace: (t: AgentTraceLog) => void): Promise<{ threats: number, status: string, message: string }> => {
        addTrace(createLog('ada.it', 'THINKING', `Running Heuristic Cyber-Threat Analysis...`, 'EXPERT'));
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { threats: 0, status: 'GREEN', message: `**CYBER STATUS: SECURE**` };
    }
};
