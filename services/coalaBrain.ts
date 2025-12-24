// services/coalaBrain.ts

import { MemoryModule, AgentTraceLog, Message, UserProfile, TenantConfig } from '../types';
import { aceService } from './aceService';
import { orchestratorService } from './orchestratorService';

/**
 * ADA COALA BRAIN
 * Implements the "Cognitive Architectures for Language Agents" framework.
 * Decision cycle: Observe -> Plan -> Act -> Reflect.
 */
class CoALABrain {
    private workingMemory: Message[] = [];
    
    // Process a new observation (user prompt or sensor event)
    async cycle(
        input: string, 
        user: UserProfile, 
        tenant: TenantConfig, 
        stats: any,
        onTrace: (t: AgentTraceLog) => void
    ) {
        const timestamp = new Date().toLocaleTimeString();

        // 1. OBSERVE (Ingest environmental state)
        onTrace({
            id: `coa_${Date.now()}_obs`,
            timestamp,
            node: 'ada.stargate',
            module: 'working',
            step: 'OBSERVE',
            content: `Ingesting observation: "${input.substring(0, 40)}..."`,
            persona: 'ORCHESTRATOR'
        });

        // 2. PLAN (Retrieve Semantic & Episodic context)
        const relevantPlaybooks = aceService.getRelevantStrategies(input);
        onTrace({
            id: `coa_${Date.now()}_plan`,
            timestamp,
            node: 'ada.stargate',
            module: 'semantic',
            step: 'PLAN',
            content: `Retrieving procedural playbooks. Found ${relevantPlaybooks.length} relevant strategies.`,
            persona: 'ORCHESTRATOR'
        });

        // 3. ACT (Execute Task via Orchestrator)
        const response = await orchestratorService.processRequest(
            input, user, this.workingMemory, tenant, stats, onTrace
        );

        // 4. REFLECT (Agentic Context Engineering - ACE)
        onTrace({
            id: `coa_${Date.now()}_ref`,
            timestamp,
            node: 'ada.stargate',
            module: 'episodic',
            step: 'REFLECT',
            content: "Evaluating execution success. Updating episodic memory nodes.",
            persona: 'ORCHESTRATOR'
        });

        // Self-Improvement Loop
        if (response.code && response.result) {
            await aceService.reflect(input, response.code, response.result, onTrace);
        }

        return response;
    }

    setHistory(history: Message[]) {
        this.workingMemory = history;
    }
}

export const coalaBrain = new CoALABrain();
