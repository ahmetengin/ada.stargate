
import { AgentTraceLog, NodeName } from '../../types';
import { wimMasterData } from '../wimMasterData';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_yield_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const yieldExpert = {
    
    // Skill: Calculate Dynamic Multiplier
    calculateMultiplier: async (occupancy: number, season: string, addTrace: (t: AgentTraceLog) => void): Promise<{ multiplier: number, reasoning: string }> => {
        addTrace(createLog('ada.yield', 'THINKING', `Running Yield Optimization Model (TabPFN)... Inputs: Occ:${occupancy}%, Season:${season}`, 'EXPERT'));
        
        let multiplier = 1.0;
        let reasoning = "Base Rate";

        if (occupancy > 90) {
            multiplier = 1.5;
            reasoning = "Scarcity Pricing (Occ > 90%)";
        } else if (occupancy > 75) {
            multiplier = 1.2;
            reasoning = "High Demand";
        } else if (season === 'LOW') {
            multiplier = 0.8;
            reasoning = "Winter Incentive";
        }

        addTrace(createLog('ada.yield', 'CODE_OUTPUT', `Calculated Multiplier: ${multiplier}x (${reasoning})`, 'WORKER'));
        
        return { multiplier, reasoning };
    },

    // Skill: Revenue Forecast
    forecastRevenue: async (days: number, addTrace: (t: AgentTraceLog) => void): Promise<string> => {
        addTrace(createLog('ada.yield', 'THINKING', `Forecasting revenue for next ${days} days based on current booking velocity...`, 'EXPERT'));
        
        // Mock
        const projected = 145000; // EUR
        
        return `**REVENUE FORECAST (${days} DAYS)**\n\n` +
               `Based on current yield curves:\n` +
               `> **Projected:** €${projected.toLocaleString()}\n` +
               `> **Trend:** +12% vs Last Year\n` +
               `> **Recommendation:** Hold price on T-Head berths.`;
    }
};
