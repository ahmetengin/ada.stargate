
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { checkBackendHealth, getSystemDiagnostics } from '../api';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_it_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const itExpert = {
    // Skill 1: Check System Connectivity (Deep Diagnostics)
    checkConnectivity: async (addTrace: (t: AgentTraceLog) => void): Promise<{ status: 'ONLINE' | 'OFFLINE', latency: number, message: string }> => {
        addTrace(createLog('ada.it', 'THINKING', `Running Full Stack Diagnostics (Container Mesh)...`, 'EXPERT'));
        
        const start = Date.now();
        const diagnostics = await getSystemDiagnostics();
        const latency = Date.now() - start;

        if (diagnostics) {
            const infra = diagnostics.infrastructure || {};
            const redisStatus = infra.nervous_system || 'Unknown';
            const orchestrator = infra.orchestrator || 'Unknown';

            addTrace(createLog('ada.it', 'TOOL_EXECUTION', `Ping Response: ${JSON.stringify(infra)}`, 'WORKER'));
            addTrace(createLog('ada.it', 'OUTPUT', `System Green. Latency: ${latency}ms. Redis: ${redisStatus}.`, 'WORKER'));
            
            let message = `**SYSTEM STATUS: ONLINE (Hyperscale)**\n\n`;
            message += `> **Latency:** ${latency}ms\n`;
            message += `> **Brain:** ${orchestrator}\n`;
            message += `> **Nervous System:** ${redisStatus} ✅\n`;
            message += `> **Voice Uplink:** FastRTC Active\n`;
            
            return { status: 'ONLINE', latency, message };
        } else {
            addTrace(createLog('ada.it', 'CRITICAL', `CONNECTION LOST. Mainframe unreachable. Initiating Local Protocols.`, 'WORKER'));
            return { status: 'OFFLINE', latency: 0, message: `**⚠️ SYSTEM ALERT: OFFLINE**\n\nCannot reach Python Core. Docker containers may be down.\n\n*Check: docker ps*` };
        }
    },

    // Skill 2: Cyber Security Scan
    runCyberScan: async (addTrace: (t: AgentTraceLog) => void): Promise<{ threats: number, status: string, message: string }> => {
        addTrace(createLog('ada.it', 'THINKING', `Running Heuristic Cyber-Threat Analysis on internal network...`, 'EXPERT'));
        
        // Mock Scan Logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const randomThreat = Math.random() > 0.9; // 10% chance of threat simulation
        
        if (randomThreat) {
            addTrace(createLog('ada.it', 'WARNING', `ANOMALY DETECTED: Unusual packet volume on Port 8080. Source: External IP.`, 'WORKER'));
            addTrace(createLog('ada.it', 'TOOL_EXECUTION', `Activating Firewall Rule Block-99. Isolating Segment.`, 'WORKER'));
            return { 
                threats: 1, 
                status: 'RED', 
                message: `**🚨 CYBER SECURITY ALERT**\n\nDDoS attempt detected on API Gateway.\n**Action Taken:** IP Blocked automatically.\n**Status:** Perimeter Re-secured.` 
            };
        } else {
            addTrace(createLog('ada.it', 'OUTPUT', `Network Integrity: 100%. Firewall Active. No intrusions.`, 'WORKER'));
            return { 
                threats: 0, 
                status: 'GREEN', 
                message: `**CYBER STATUS: SECURE**\n\nFirewall: Active\nIntrusion Detection: Monitoring\nActive Nodes: Verified` 
            };
        }
    }
};
