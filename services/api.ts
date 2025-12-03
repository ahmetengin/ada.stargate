
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health'); // Proxied to port 8000
    return response.ok; 
  } catch { return false; }
};

export const sendToBackend = async (prompt: string, userProfile: any, context: any = {}): Promise<any> => {
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
        return await response.json();
    } catch (e) {
        console.error(e);
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
        console.error(e);
        return null;
    }
};