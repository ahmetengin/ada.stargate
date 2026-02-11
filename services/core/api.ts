
import { UserProfile, AgentAction, AgentTraceLog } from "../../types";

const API_BASE = '/api/v1';

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(`${API_BASE}/health`, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) return false;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return false;

        return true;
    } catch (e) {
        return false;
    }
};

export const getSystemDiagnostics = async (): Promise<any> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("Health check failed");
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Invalid response type");

        const data = await res.json();
        return {
            status: data.status === 'COGNITIVE_SYSTEM_ONLINE' ? 'ONLINE' : 'DEGRADED',
            infrastructure: {
                orchestrator: data.modules?.includes('LangGraph') ? 'ACTIVE' : 'ERROR',
                nervous_system: 'REDIS_CONNECTED', 
                memory: data.modules?.includes('RAG') ? 'QDRANT_LINKED' : 'OFFLINE'
            }
        };
    } catch (e) {
        return null;
    }
};

// Global session storage for learned rules (SEAL Protocol)
// This persists the "Self-Edits" the model generates during the session
let sessionSelfEdits: string[] = [];

export const sendToBackend = async (
    prompt: string, 
    userProfile: UserProfile, 
    context: any = {}
): Promise<{ text: string, traces: AgentTraceLog[] } | null> => {
    try {
        const payload = {
            prompt: prompt,
            user_role: userProfile.role,
            self_edits: sessionSelfEdits, // Send learned rules context
            context: {
                ...context,
                user_id: userProfile.id,
                timestamp: new Date().toISOString()
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout for Chain of Thought

        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Backend returned non-JSON response");
        }

        const data = await res.json();
        
        // SEAL: Update local session state with new rules learned in this turn
        if (data.self_edits && Array.isArray(data.self_edits)) {
            sessionSelfEdits = data.self_edits;
        }

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
        console.error("Backend Chat Error:", error);
        return null;
    }
}

export const invokeAgentSkill = async (agent: string, skill: string, params: any = {}): Promise<any> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${API_BASE}/agent/${agent}/${skill}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return null;

        return await res.json();
    } catch (e) {
        return null;
    }
};
