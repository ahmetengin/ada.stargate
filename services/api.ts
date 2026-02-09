
import { UserProfile, AgentAction, AgentTraceLog } from "../types";

// PROD: Points to Nginx Proxy -> Python Backend
const API_BASE = '/api/v1';

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/health`); // Calls backend/main.py
        return res.ok;
    } catch (e) {
        console.warn("[System] Backend unreachable:", e);
        return false;
    }
};

export const getSystemDiagnostics = async (): Promise<any> => {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        return {
            status: data.status === 'COGNITIVE_SYSTEM_ONLINE' ? 'ONLINE' : 'DEGRADED',
            infrastructure: {
                orchestrator: data.modules.includes('LangGraph') ? 'ACTIVE' : 'ERROR',
                nervous_system: 'REDIS_CONNECTED', // Assumed if API responds
                memory: data.modules.includes('RAG') ? 'QDRANT_LINKED' : 'OFFLINE'
            }
        };
    } catch (e) {
        return null;
    }
};

export const sendToBackend = async (
    prompt: string, 
    userProfile: UserProfile, 
    context: any = {}
): Promise<{ text: string, traces: AgentTraceLog[] } | null> => {
    try {
        const payload = {
            prompt: prompt,
            user_role: userProfile.role,
            context: {
                ...context,
                user_id: userProfile.id,
                timestamp: new Date().toISOString()
            }
        };

        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        
        // Transform Backend Traces to Frontend Format
        const traces: AgentTraceLog[] = (data.traces || []).map((t: any) => ({
            id: `tr_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            node: t.node || 'ada.core',
            step: t.step || 'OUTPUT',
            content: t.content,
            persona: t.node === 'router' ? 'ORCHESTRATOR' : 'WORKER'
        }));

        return { text: data.text, traces };
    } catch (error) {
        console.error("[API] Failed to reach Brain:", error);
        return null; // Fallback to local Gemini Service
    }
}

export const invokeAgentSkill = async (agent: string, skill: string, params: any = {}): Promise<any> => {
    // Direct RPC call to specific agents (e.g., Ada.Finance check_debt)
    try {
        const res = await fetch(`${API_BASE}/agent/${agent}/${skill}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};

export const submitFeedback = async (messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<boolean> => {
    // Log feedback for SEAL reinforcement learning
    console.log(`[Feedback] ${messageId}: ${rating}`);
    return true;
};
