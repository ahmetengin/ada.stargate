
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { systemUpdateExpert } from '../skills/systemUpdater';
import { TaskHandlerFn } from '../decomposition/types';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_sys_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const systemExpert = {
    // Skill: Parse and Apply Rule Updates
    processRuleUpdate: async (prompt: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, actions: AgentAction[] }> => {
        const lowerPrompt = prompt.toLowerCase();
        addTrace(createLog('ada.stargate', 'THINKING', `Analyzing configuration update request: "${prompt}"...`, 'EXPERT'));

        let key = '';
        let value: any = null;
        let humanReadableKey = '';

        // 1. Determine Key Mapping (Simple NLP Logic)
        if (lowerPrompt.includes('speed') && (lowerPrompt.includes('limit') || lowerPrompt.includes('max'))) {
            key = 'speed_limit_knots';
            humanReadableKey = 'Speed Limit';
        } else if (lowerPrompt.includes('loa') || lowerPrompt.includes('length')) {
            key = 'max_loa';
            humanReadableKey = 'Max LOA';
        } else if (lowerPrompt.includes('draft') || lowerPrompt.includes('depth')) {
            key = 'max_draft';
            humanReadableKey = 'Max Draft';
        } else if (lowerPrompt.includes('currency')) {
            key = 'currency';
            humanReadableKey = 'Currency';
        } else if (lowerPrompt.includes('guest') || lowerPrompt.includes('visitor') || lowerPrompt.includes('access') || lowerPrompt.includes('entry')) {
            key = 'guest_policy';
            humanReadableKey = 'Guest Access Policy';
        } else {
            addTrace(createLog('ada.stargate', 'ERROR', `Could not identify a valid configuration key in prompt.`, 'WORKER'));
            return {
                success: false,
                message: "I couldn't identify which rule you want to update. I support: Speed Limit, Max LOA, Max Draft, Currency, Guest Access.",
                actions: []
            };
        }

        // 2. Extract Value
        if (key === 'currency') {
            if (lowerPrompt.includes('eur')) value = 'EUR';
            else if (lowerPrompt.includes('usd')) value = 'USD';
            else if (lowerPrompt.includes('try') || lowerPrompt.includes('lira')) value = 'TRY';
        } else if (key === 'guest_policy') {
            if (lowerPrompt.includes('member') || lowerPrompt.includes('private')) value = 'MEMBERS_ONLY';
            else if (lowerPrompt.includes('open') || lowerPrompt.includes('public') || lowerPrompt.includes('free')) value = 'OPEN_ACCESS';
            else if (lowerPrompt.includes('invite') || lowerPrompt.includes('appointment')) value = 'BY_APPOINTMENT';
            else if (lowerPrompt.includes('closed') || lowerPrompt.includes('lock')) value = 'LOCKED';
            else value = 'RESTRICTED';
        } else {
            // Extract number
            const matches = prompt.match(/(\d+(\.\d+)?)/);
            if (matches) {
                value = parseFloat(matches[0]);
            }
        }

        if (value === null) {
            addTrace(createLog('ada.stargate', 'ERROR', `Could not extract a valid value for ${humanReadableKey}.`, 'WORKER'));
            return {
                success: false,
                message: `I understood you want to update ${humanReadableKey}, but I couldn't find the new value.`,
                actions: []
            };
        }

        // 3. Execute Update via Skill
        addTrace(createLog('ada.stargate', 'TOOL_EXECUTION', `Patching Tenant Configuration: ${key} = ${value}`, 'WORKER'));
        const action = await systemUpdateExpert.updateRule(key, value);

        addTrace(createLog('ada.stargate', 'OUTPUT', `Configuration updated successfully.`, 'EXPERT'));

        return {
            success: true,
            message: `**SYSTEM UPDATE CONFIRMED**\n\nOperational Rule Modified:\n> **${humanReadableKey}:** set to **${value}**\n\n*Changes applied to active context immediately.*`,
            actions: [action]
        };
    }
};

// --- Handlers for the Brain ---
export const systemHandlers: Record<string, TaskHandlerFn> = {
    'system.updateRule': async (ctx: any, obs: any) => {
        const { prompt } = obs.payload;
        const result = await systemExpert.processRuleUpdate(prompt, () => {});
        return result.actions;
    }
};
