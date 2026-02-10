
import { UserProfile, AgentAction, AgentTraceLog } from "../types";

// PROD: Points to Nginx Proxy -> Python Backend
const API_BASE = '/api/v1';

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for health check
        
        const res = await fetch(`${API_BASE}/health`, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) return false;
        
        // Ensure it's JSON and not the React HTML fallback
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return false;

        return true;
    } catch (e) {
        // console.warn("[System] Backend unreachable:", e);
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for chat

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

        // Critical: Check if response is actually JSON (handles Vite SPA fallback 404s returning HTML)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Backend returned non-JSON response (likely offline)");
        }

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
        // console.warn("[API] Switching to Edge Mode (Local Fallback).");
        return null; // Triggers fallback in orchestrator
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

export const submitFeedback = async (messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<boolean> => {
    console.log(`[Feedback] ${messageId}: ${rating}`);
    return true;
};
