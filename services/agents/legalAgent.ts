
import { AgentAction, UserProfile, AgentTraceLog } from '../../types';
import { invokeAgentSkill } from '../api';

export const legalExpert = {
  
  process: async (params: any, user: UserProfile, addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
    
    // RBAC Check
    if (user.role !== 'GENERAL_MANAGER' && user.role !== 'CAPTAIN') {
        return [{
            id: `legal_deny_${Date.now()}`,
            kind: 'internal',
            name: 'ada.legal.accessDenied',
            params: { reason: 'Requires authorized role.' }
        }];
    }

    const { query } = params;
    
    addTrace({
        id: `trace_legal_rag_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        node: 'ada.legal',
        step: 'THINKING',
        content: `Querying Qdrant Vector Memory for: "${query}"...`,
        persona: 'EXPERT'
    });

    let advice = "";
    
    // 1. Try Backend RAG
    try {
        const ragResult = await invokeAgentSkill('legal', 'rag_query', { query });
        if (ragResult && ragResult.result) {
            advice = ragResult.result;
            addTrace({
                id: `trace_legal_rag_res_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                node: 'ada.legal',
                step: 'OUTPUT',
                content: `Retrieved ${ragResult.docs?.length || 0} documents from knowledge base.`,
                persona: 'WORKER'
            });
        } else {
            advice = "Legal database connection failed.";
        }
    } catch (e) {
        advice = "Unable to reach Legal Core. Please check system status.";
    }

    return [{
        id: `legal_resp_${Date.now()}`,
        kind: 'internal',
        name: 'ada.legal.consultation',
        params: { 
            advice: advice,
            context: "RAG Retrieval",
            references: []
        }
    }];
  }
};
