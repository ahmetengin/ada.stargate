
import { UserProfile } from "../types";

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); 
    // Use relative path which Nginx or Vite will proxy
    const response = await fetch('/api/health', { signal: controller.signal });
    clearTimeout(id);
    return response.ok; 
  } catch { return false; }
};

export const getSystemDiagnostics = async (): Promise<any> => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const response = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) return null;
        return await response.json();
    } catch { return null; }
};

export const sendToBackend = async (prompt: string, userProfile: UserProfile, context: any = {}): Promise<any> => {
    try {
        const controller = new AbortController();
        // 10s timeout for complex chains
        const id = setTimeout(() => controller.abort(), 10000); 

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
        
        if (!response.ok) {
            console.warn(`Backend returned status ${response.status}`);
            return null; // Trigger fallback
        }
        return await response.json();
    } catch (e) {
        console.warn("Backend Unreachable (Network Error):", e);
        return null; // Trigger fallback
    }
}

export const invokeAgentSkill = async (agent: string, skill: string, params: any = {}): Promise<any> => {
    try {
        const response = await fetch(`/api/v1/agent/${agent}/${skill}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
};

export const submitFeedback = async (messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/v1/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message_id: messageId,
                rating: rating,
                correction: comment
            })
        });
        return response.ok;
    } catch (e) {
        console.error("Failed to submit feedback:", e);
        return false;
    }
};
