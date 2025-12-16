
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { wimMasterData } from '../wimMasterData';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_concierge_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const conciergeExpert = {
    
    // Skill: Call Buggy (Golf Cart)
    requestBuggy: async (location: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string }> => {
        addTrace(createLog('ada.concierge', 'THINKING', `Locating nearest available buggy for ${location}...`, 'EXPERT'));
        
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const buggyId = "BUGGY-04";
        const eta = "3 mins";

        addTrace(createLog('ada.concierge', 'TOOL_EXECUTION', `Dispatched ${buggyId} from Main Station. Driver: Hasan K.`, 'WORKER'));

        return {
            success: true,
            message: `**BUGGY DISPATCHED**\n\nUnit: **${buggyId}**\nLocation: **${location}**\nETA: **${eta}**\n\n*Please wait at the pontoon gate.*`
        };
    },

    // Skill: Order Provisions (Ice/Coffee/Market)
    orderProvisions: async (items: string, vesselName: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, total?: number }> => {
        addTrace(createLog('ada.concierge', 'THINKING', `Processing provision order for ${vesselName}: ${items}`, 'EXPERT'));

        // Identify items and mock prices
        let total = 0;
        let summary = "";
        
        if (items.toLowerCase().includes('ice') || items.toLowerCase().includes('buz')) {
            total += 5;
            summary += "- 2 Bags of Ice (€5.00)\n";
        }
        if (items.toLowerCase().includes('coffee') || items.toLowerCase().includes('kahve')) {
            total += 12;
            summary += "- 2x Latte, 1x Espresso (€12.00)\n";
        }
        
        if (total === 0) {
             // Fallback for generic items
             total = 25;
             summary = `- Assorted Provisions: ${items} (€25.00)\n`;
        }

        addTrace(createLog('ada.concierge', 'TOOL_EXECUTION', `Order relay to Migros Jet / Starbucks. Stock confirmed.`, 'WORKER'));
        
        // Trigger finance charge
        addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Charging €${total} to ${vesselName} account.`, 'WORKER'));

        return {
            success: true,
            message: `**ORDER CONFIRMED**\n\nDestination: **${vesselName}**\nItems:\n${summary}\n**Total Charged: €${total.toFixed(2)}**\n\n*Delivery in approx 15 mins.*`,
            total: total
        };
    },

    // Skill: Housekeeping / Laundry
    scheduleService: async (serviceType: string, vesselName: string, time: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string }> => {
        addTrace(createLog('ada.concierge', 'PLANNING', `Scheduling ${serviceType} for ${vesselName} at ${time || 'ASAP'}...`, 'EXPERT'));
        
        const team = "Housekeeping Team B";
        
        addTrace(createLog('ada.concierge', 'TOOL_EXECUTION', `Assigned ${team}. Checking access permissions... OK.`, 'WORKER'));

        return {
            success: true,
            message: `**SERVICE SCHEDULED**\n\nService: **${serviceType}**\nVessel: **${vesselName}**\nTeam: **${team}**\nTime: **${time || 'Immediate'}**`
        };
    },
    
    // Skill: Taxi / Transfer
    callTaxi: async (location: string, destination: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string }> => {
        addTrace(createLog('ada.concierge', 'THINKING', `Hailing VIP Taxi to ${location}...`, 'EXPERT'));
        
        const plate = "34 TCD 89";
        const model = "Mercedes Vito (Black)";
        
        addTrace(createLog('ada.concierge', 'TOOL_EXECUTION', `Taxi Confirmed via BiTaksi Corporate API.`, 'WORKER'));
        
        return {
            success: true,
            message: `**TAXI EN ROUTE**\n\nVehicle: **${model}**\nPlate: **${plate}**\nPickup: **${location}**\n\n*Driver will call you upon arrival.*`
        };
    }
};
