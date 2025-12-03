
import { UserProfile } from "../types";

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Nginx proxy forwards /api to backend:8000
    const response = await fetch('/api/health'); 
    return response.ok; 
  } catch { return false; }
};

export const sendToBackend = async (prompt: string, userProfile: UserProfile, context: any = {}): Promise<any> => {
    try {
        const response = await fetch('/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                user_role: userProfile.role,
                context: context
            })
        });
        if (!response.ok) throw new Error("Backend Error");
        return await response.json();
    } catch (e) {
        console.error("Backend Communication Failed:", e);
        return null;
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
        console.error(`Skill Invocation Failed (${agent}.${skill}):`, e);
        return null;
    }
};
