
// services/agents/presenterExpert.ts
// DEPRECATED: Narrative is now handled directly by PresentationOverlay.tsx

import { AgentAction, AgentTraceLog } from '../../types';

export const presenterExpert = {
    playIntro: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        return [];
    },
    playSenses: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        return [];
    },
    playBrain: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        return [];
    },
    playHandover: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        return [];
    }
};
