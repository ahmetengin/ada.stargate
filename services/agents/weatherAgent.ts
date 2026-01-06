
// services/agents/weatherAgent.ts
import { TaskHandlerFn } from '../decomposition/types';
import { AgentTraceLog, NodeName } from '../../types';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_wx_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

const getCurrent: TaskHandlerFn = async (ctx, obs) => {
  return [{
    id: `act_${Date.now()}`,
    kind: 'internal',
    name: 'weather.conditions.checked',
    params: { status: 'OK', summary: 'Wind 15kts NW, Clear skies.' },
  }];
};

const broadcastWarning: TaskHandlerFn = async (ctx, obs) => {
    return [{
        id: `act_${Date.now()}`,
        kind: 'external',
        name: 'weather.broadcastWarning',
        params: { message: 'Gale warning issued for Sector Zulu. All vessels are advised to return to port or seek shelter.' },
    }];
};

// --- EXPERT INTERFACE (For Direct Access) ---
export const weatherExpert = {
    getCurrentConditions: async (location: string, addTrace: (t: AgentTraceLog) => void): Promise<any> => {
        addTrace(createLog('ada.weather', 'THINKING', `Analyzing micro-climate sensors for ${location}...`, 'EXPERT'));
        
        // Mock Real-time Data
        const data = {
            temp: 24,
            wind: { speed: 12.5, dir: 'NW', gust: 18 },
            pressure: 1013,
            humidity: 65,
            visibility: 'Good (>10nm)'
        };

        addTrace(createLog('ada.weather', 'OUTPUT', `Conditions: ${data.wind.speed}kn ${data.wind.dir}. Vis: ${data.visibility}.`, 'WORKER'));
        
        return data;
    },
    
    forecastStorm: async (hours: number, addTrace: (t: AgentTraceLog) => void): Promise<boolean> => {
        addTrace(createLog('ada.weather', 'THINKING', `Running predictive model for next ${hours} hours...`, 'EXPERT'));
        // 20% chance of storm in simulation
        const risk = Math.random() > 0.8;
        if (risk) {
             addTrace(createLog('ada.weather', 'WARNING', `STORM CELL DETECTED. ETA: 4 Hours.`, 'WORKER'));
        }
        return risk;
    }
};

export const weatherHandlers: Record<string, TaskHandlerFn> = {
  'weather.getCurrent': getCurrent,
  'weather.broadcastWarning': broadcastWarning,
};
