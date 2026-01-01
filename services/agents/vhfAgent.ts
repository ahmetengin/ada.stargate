
import { AgentTraceLog, NodeName } from '../../types';
import { getCurrentMaritimeTime } from '../utils';

// Standard logging helper
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_vhf_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const vhfExpert = {
    // Log transmission to the system trace
    logTransmission: async (channel: string, message: string, addTrace: (t: AgentTraceLog) => void) => {
        // Simulate a "Listening" step
        addTrace(createLog('ada.vhf', 'THINKING', `Monitoring Channel ${channel} (156.625 MHz)... Signal Detected.`, 'EXPERT'));
        
        // Simulate the Transcription/Action
        setTimeout(() => {
            addTrace(createLog('ada.vhf', 'OUTPUT', `[CH ${channel}] TX: "${message}"`, 'WORKER'));
        }, 500);
    },

    // Simulate an incoming hail (e.g. from another vessel)
    simulateIncomingHail: async (vesselName: string, channel: string, addTrace: (t: AgentTraceLog) => void) => {
        addTrace(createLog('ada.vhf', 'THINKING', `Squuelch Break on CH ${channel}. Analyzing Audio Signature...`, 'EXPERT'));
        
        setTimeout(() => {
             addTrace(createLog('ada.vhf', 'TOOL_EXECUTION', `Incoming Transmission: "${vesselName} calling WIM Control. Requesting radio check."`, 'WORKER'));
        }, 800);
    }
};
