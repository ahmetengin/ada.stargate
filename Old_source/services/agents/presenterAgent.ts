
// services/agents/presenterAgent.ts
// DEPRECATED: Renamed to presenterExpert.ts

import { AgentAction, AgentTraceLog } from '../../types';

export const presenterExpert = {
    playIntro: async (addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        return [];
    }
};
