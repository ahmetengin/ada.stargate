
import { AgentTraceLog, Message, UserProfile, TenantConfig, EpisodeId } from '../../types';
import { aceService } from './aceService';
import { orchestratorService } from './orchestratorService';

class CoALABrain {
    private workingMemory: Message[] = [];
    
    async cycle(
        input: string, 
        user: UserProfile, 
        tenant: TenantConfig, 
        stats: any,
        onTrace: (t: AgentTraceLog) => void
    ) {
        const timestamp = new Date().toLocaleTimeString();

        onTrace({
            id: `coa_${Date.now()}_obs`,
            timestamp,
            node: 'ada.stargate',
            module: 'working',
            step: 'OBSERVE',
            content: `Observation: "${input.substring(0, 40)}..."`,
            persona: 'ORCHESTRATOR'
        });

        let detectedEpisode: EpisodeId = 'NONE';
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('geliyor') || lowerInput.includes('yaklaşıyor') || lowerInput.includes('arriving')) {
            detectedEpisode = 'EPISODE_A';
        } else if (lowerInput.includes('mayday') || lowerInput.includes('fire') || lowerInput.includes('yangın') || lowerInput.includes('acil')) {
            detectedEpisode = 'EPISODE_B';
        } else if (lowerInput.includes('sigorta') || lowerInput.includes('insurance') || lowerInput.includes('hasar')) {
            detectedEpisode = 'EPISODE_C';
        } else if (lowerInput.includes('tahliye') || lowerInput.includes('extraction') || lowerInput.includes('acil çıkış')) {
            detectedEpisode = 'EPISODE_G';
        }

        if (detectedEpisode !== 'NONE') {
            onTrace({
                id: `coa_${Date.now()}_epi`,
                timestamp,
                node: 'ada.stargate',
                step: 'PLANNING',
                content: `Protocol Match: ${detectedEpisode}. Loading tactical context...`,
                persona: 'ORCHESTRATOR'
            });
        }

        const response = await orchestratorService.processRequest(
            input, user, this.workingMemory, tenant, stats, onTrace
        );

        if (detectedEpisode === 'EPISODE_A') {
            onTrace({
                id: `chatter_${Date.now()}`,
                timestamp,
                node: 'ada.marina -> ada.sea.phisedelia',
                step: 'ACT',
                content: "Hail Transmission: 'Welcome Home. Berth C-12 prepped. Shore power sync started.'",
                persona: 'WORKER'
            });
        }

        if (response.code && response.result) {
            await aceService.reflect(input, response.code, response.result, onTrace);
        }

        return {
            ...response,
            episodeId: detectedEpisode,
            nodePath: detectedEpisode !== 'NONE' ? 'ada.stargate -> ada.marina' : undefined
        };
    }

    setHistory(history: Message[]) {
        this.workingMemory = history;
    }
}

export const coalaBrain = new CoALABrain();
