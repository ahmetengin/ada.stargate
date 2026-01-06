
import { UserProfile } from "../types";

// Reverted to simple client-side checks.
// No more calls to localhost:8000

export const checkBackendHealth = async (): Promise<boolean> => {
    // Since we are client-side only, we are always "online" if the app is loaded
    return true;
};

export const getSystemDiagnostics = async (): Promise<any> => {
    return {
        status: 'ONLINE',
        mode: 'CLIENT_SIDE_ONLY',
        memory: 'LOCAL'
    };
};

export const sendToBackend = async (prompt: string, userProfile: UserProfile, context: any = {}): Promise<any> => {
    // Instead of sending to a Python backend, we return null 
    // so the UI falls back to the local Gemini Service (services/geminiService.ts)
    return null;
}

export const invokeAgentSkill = async (agent: string, skill: string, params: any = {}): Promise<any> => {
    // In a pure client-side app, we map these calls to local Typescript functions
    // This serves as a placeholder if we want to add local skill routing later
    console.warn(`Attempted to invoke skill ${skill} on ${agent} locally.`);
    return null;
};

export const submitFeedback = async (messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<boolean> => {
    console.log(`[Feedback] ${messageId}: ${rating} - ${comment}`);
    return true;
};
