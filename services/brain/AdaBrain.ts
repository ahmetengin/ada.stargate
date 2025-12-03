// services/brain/AdaBrain.ts
import { AgentContext, AgentObservation, AgentAction, DecisionStepLog } from './types';
import { runMdapGraph } from '../decomposition/mdapExecutor';

export class AdaBrain {
  private context: AgentContext;
  private logs: DecisionStepLog[] = [];

  constructor(initialContext?: Partial<AgentContext>) {
    this.context = {
      workingMemory: [],
      episodicMemory: [],
      semanticMemory: [],
      proceduralMemory: [],
      ...initialContext,
    } as AgentContext;
  }

  getContext() {
    return this.context;
  }

  getLogs() {
    return this.logs;
  }

  async handleObservation(obs: AgentObservation, mdapGraphId: string): Promise<AgentAction[]> {
    this.logs.push({
      timestamp: Date.now(),
      step: 'OBSERVATION_RECEIVED',
      details: obs
    });

    try {
      const actions = await runMdapGraph(mdapGraphId, this.context, obs);
      
      this.logs.push({
        timestamp: Date.now(),
        step: 'MDAP_EXECUTION_COMPLETE',
        details: { actionCount: actions.length }
      });

      return actions;
    } catch (error: any) {
      console.error("AdaBrain execution error:", error);
      this.logs.push({
        timestamp: Date.now(),
        step: 'EXECUTION_ERROR',
        details: { message: error.message },
        isError: true
      });
      return [];
    }
  }
}
