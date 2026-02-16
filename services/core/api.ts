
import { UserProfile, AgentTraceLog } from "../../types";

const API_BASE = '/api/v1';

// Aggressive Health Check
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        // Short timeout: If backend isn't ready in 1.5s, assume it's dead.
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        
        const res = await fetch(`${API_BASE}/health`, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) return false;
        
        // Critical: Verify it is JSON (not Nginx HTML error page)
        const contentType = res.headers.get("content-type");
        return !!(contentType && contentType.includes("application/json"));
    } catch (e) {
        return false;
    }
};

// Global session state
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
            self_edits: sessionSelfEdits,
            context: {
                ...context,
                user_id: userProfile.id,
                timestamp: new Date().toISOString()
            }
        };

        const controller = new AbortController();
        // 8s Timeout. If LangGraph is too slow, we switch to Edge to keep UI snappy.
        const timeoutId = setTimeout(() => controller.abort(), 8000); 

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

        // 1. HTTP Error Check
        if (!res.ok) {
            console.warn(`[API] Backend HTTP Error: ${res.status}`);
            return null; // Trigger Edge Fallback
        }

        // 2. Content-Type Check (Guard against Nginx 502 HTML)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn("[API] Invalid Content-Type (Likely Nginx Error Page). Switching to Edge.");
            return null;
        }

        const data = await res.json();
        
        // 3. Logic Error Check (Did backend return a soft error?)
        if (data.error) {
             console.warn("[API] Backend Logic Error:", data.error);
             return null;
        }

        // Sync Session State
        if (data.self_edits && Array.isArray(data.self_edits)) {
            sessionSelfEdits = data.self_edits;
        }

        // Map Traces
        const traces: AgentTraceLog[] = (data.traces || []).map((t: any) => ({
            id: `tr_be_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            node: t.node || 'ada.core',
            step: t.step || 'OUTPUT',
            content: t.content || JSON.stringify(t),
            persona: t.node === 'router' ? 'ORCHESTRATOR' : 'WORKER'
        }));

        return { text: data.text, traces };

    } catch (error) {
        // Network error, timeout, or JSON parse error
        console.warn("[API] Backend unreachable or timed out:", error);
        return null; // Trigger Edge Fallback
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

export const getSystemDiagnostics = async () => {
    const health = await checkBackendHealth();
    return {
        status: health ? 'ONLINE' : 'EDGE_MODE',
        infrastructure: { 
            orchestrator: health ? 'ACTIVE' : 'LOCAL', 
            nervous_system: health ? 'CONNECTED' : 'DISCONNECTED', 
            memory: health ? 'LINKED' : 'LOCAL_CACHE' 
        }
    };
};
