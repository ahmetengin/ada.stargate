
import { AgentTraceLog, NodeName } from '../../types';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_vhf_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const vhfExpert = {
    
    /**
     * Analyzes incoming text and suggests IMO SMCP compliant responses.
     */
    analyzeTransmission: (text: string): { suggestions: string[], type: 'ROUTINE' | 'SAFETY' | 'DISTRESS' | 'URGENCY' } => {
        const lower = text.toLowerCase();
        let type: 'ROUTINE' | 'SAFETY' | 'DISTRESS' | 'URGENCY' = 'ROUTINE';
        const suggestions: string[] = [];

        // 1. Distress / Urgency Detection
        if (lower.includes('mayday') || lower.includes('sinking') || lower.includes('fire')) {
            type = 'DISTRESS';
            suggestions.push('RECEIVED MAYDAY', 'ETA RESCUE', 'SWITCH CH 16');
        } else if (lower.includes('pan') || lower.includes('engine failure') || lower.includes('medical')) {
            type = 'URGENCY';
            suggestions.push('RECEIVED PAN-PAN', 'STAND BY', 'ADVISE INTENTIONS');
        } else if (lower.includes('securite') || lower.includes('weather') || lower.includes('debris')) {
            type = 'SAFETY';
            suggestions.push('RECEIVED SECURITE', 'INFORMATION NOTED');
        }

        // 2. Standard Protocol Handling
        if (lower.includes('check') || lower.includes('copy') || lower.includes('hear me')) {
            suggestions.push('READ YOU 5 BY 5', 'LOUD AND CLEAR', 'WEAK SIGNAL');
        }
        
        if (lower.includes('repeat') || lower.includes('say again')) {
            suggestions.push('I SAY AGAIN', 'ALL AFTER...', 'ALL BEFORE...');
        }

        if (lower.includes('berth') || lower.includes('dock') || lower.includes('arrival')) {
            suggestions.push('PROCEED TO BERTH', 'STAND BY CH 72', 'CONTACT PALAMAR');
        }

        // Default Handshakes
        if (suggestions.length === 0) {
            suggestions.push('ROGER', 'AFFIRMATIVE', 'NEGATIVE', 'SAY AGAIN', 'STAND BY');
        }

        return { suggestions, type };
    },

    /**
     * Formats a message into strict SMCP format.
     */
    formatMessage: (caller: string, target: string, message: string): string => {
        return `${target}, ${target}, ${target}. This is ${caller}, ${caller}, ${caller}. ${message}. Over.`;
    }
};
