// services/api.ts

/**
 * Checks if the Python backend is reachable.
 * In production (Docker/Nginx), this hits the /api/ proxy.
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    
    // Use relative path to leverage Nginx proxy
    const response = await fetch('/api/health', { 
      method: 'GET',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok; 
  } catch (error) {
    return false;
  }
};

/**
 * Sends a conversational prompt to the Python Orchestrator with RICH CONTEXT.
 */
export const sendToBackend = async (prompt: string, userProfile: any, context: any = {}): Promise<any> => {
    try {
        // Relative path routed by Nginx -> ada-backend:8000
        const response = await fetch('/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                user_role: userProfile.role,
                context: {
                    ...context,
                    // Inject User Identity
                    user_id: userProfile.id,
                    user_name: userProfile.name
                }
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Backend API Call Failed:", error);
        throw error;
    }
}

/**
 * Triggers the Knowledge Ingestion Protocol (SEAL).
 * This tells the backend to re-read the docs and update vectors.
 */
export const triggerLearningProtocol = async (): Promise<any> => {
    try {
        const response = await fetch('/api/v1/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        return await response.json();
    } catch (error) {
        console.error("Learning Trigger Failed:", error);
        return { status: 'error', message: 'Could not trigger learning.' };
    }
}

/**
 * Invokes a specific skill on a specific agent (RPC Style).
 */
export const invokeAgentSkill = async (agentName: string, skillName: string, params: any): Promise<any> => {
    try {
        const response = await fetch(`/api/v1/agent/${agentName}/${skillName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!response.ok) throw new Error(`Skill invocation failed: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.warn(`Backend skill ${agentName}.${skillName} unavailable. Using local fallback.`);
        return null;
    }
}
