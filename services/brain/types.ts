// services/brain/types.ts
export type MemoryType = 'working' | 'episodic' | 'semantic' | 'procedural';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  timestamp: number;
  key: string;
  data: any;
  tags?: string[];
}

export interface AgentContext {
  workingMemory: MemoryItem[];
  episodicMemory: MemoryItem[];
  semanticMemory: MemoryItem[];
  proceduralMemory: MemoryItem[];
}

export interface DecisionStepLog {
  timestamp: number;
  step: string;
  details?: any;
  isError?: boolean;
}

export interface AgentObservation {
  source: 'user' | 'api' | 'sensor' | 'internal';
  payload: any;
  timestamp: number;
}

export interface AgentAction {
  id: string;
  kind: 'internal' | 'external';
  name: string;
  params: any;
}
