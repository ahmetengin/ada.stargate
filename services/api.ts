
import { UserProfile } from "../types";

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const response = await fetch('/api/health', { signal: controller.signal });
    clearTimeout(id);
    return response.ok; 
  } catch { return false; }
};

export const getSystemDiagnostics = async (): Promise<any> => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        const response = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) return null;
        return await response.json();
    } catch { return null; }
};

export const sendToBackend = async (prompt: string, userProfile: UserProfile, context: any = {}): Promise<any> => {
    try {
        // Short timeout for better UX - fail fast to fallback
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000); // 5s max for backend

        const response = await fetch('/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                user_role: userProfile.role,
                context: context
            }),
            signal: controller.signal
        });
        clearTimeout(id);
        
        if (!response.ok) throw new Error(`Backend Status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.warn("Backend API Unreachable:", e);
        return null; // Return null to trigger fallback in Orchestrator
    }
}

export const invokeAgentSkill = async (agent: string, skill: string, params: any = {}): Promise<any> => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`/api/v1/agent/${agent}/${skill}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
            signal: controller.signal
        });
        clearTimeout(id);
        
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
};
