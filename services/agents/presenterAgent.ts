
import { AgentAction, AgentTraceLog, NodeName } from '../../types';

// Helper
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string): AgentTraceLog => ({
    id: `trace_pres_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona: 'ORCHESTRATOR'
});

export const presenterExpert = {
    // Stage 1: Intro (Identity)
    playIntro: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.presenter', 'THINKING', 'Initializing Keynote Protocol... Role: Cognitive OS.'));
        addTrace(createLog('ada.presenter', 'OUTPUT', 'Speaking: "I am Ada. Not a chatbot, but a living system."'));
        
        return [
            {
                id: 'pres_ui_intro',
                kind: 'internal',
                name: 'ui.setPresentationSlide',
                params: { slide: 1 }
            }
        ];
    },

    // Stage 2: Senses (Ops View)
    playSenses: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.presenter', 'ROUTING', 'Switching Visuals -> OPERATIONS CENTER (Live Radar)'));
        addTrace(createLog('ada.marina', 'TOOL_EXECUTION', 'Activating Threat Detection Simulation... Target: Pontoon A.'));
        
        return [
            {
                id: 'pres_ui_ops',
                kind: 'internal',
                name: 'ui.switchDashboardTab',
                params: { tabId: 'ops' } // Shows Map & Radar
            },
            {
                id: 'pres_slide_2',
                kind: 'internal',
                name: 'ui.setPresentationSlide',
                params: { slide: 2 }
            }
        ];
    },

    // Stage 3: Brain (Finance/Analytics)
    playBrain: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.presenter', 'ROUTING', 'Switching Visuals -> STRATEGIC ANALYTICS (TabPFN)'));
        addTrace(createLog('ada.finance', 'TOOL_EXECUTION', 'Calculating instant yield forecast...'));
        
        return [
            {
                id: 'pres_ui_analytics',
                kind: 'internal',
                name: 'ui.switchDashboardTab',
                params: { tabId: 'analytics' } // Shows Graphs
            },
            {
                id: 'pres_slide_3',
                kind: 'internal',
                name: 'ui.setPresentationSlide',
                params: { slide: 3 }
            }
        ];
    },

    // Stage 4: Handover (Q&A)
    playHandover: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.presenter', 'FINAL_ANSWER', 'Protocol Complete. Handing control to Ahmet Engin. Mic Active.'));
        
        return [
            {
                id: 'pres_ui_reset',
                kind: 'internal',
                name: 'ui.switchDashboardTab',
                params: { tabId: 'ops' } // Back to main view
            },
            {
                id: 'pres_slide_4',
                kind: 'internal',
                name: 'ui.setPresentationSlide',
                params: { slide: 4 }
            }
        ];
    }
};
