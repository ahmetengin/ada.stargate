
// services/ai/aceService.ts
import { PlaybookStrategy, AgentTraceLog } from '../../types';
import { persistenceService } from '../utils/persistence';

const STORAGE_KEY = 'ada_ace_playbook_v2';

class ACEService {
    private playbook: PlaybookStrategy[] = [];

    constructor() {
        this.playbook = persistenceService.load(STORAGE_KEY, this.getInitialStrategies());
    }

    private getInitialStrategies(): PlaybookStrategy[] {
        return [
            {
                id: 'strat_001',
                domain: 'MARINA',
                title: 'High-Confidence Mooring',
                content: 'Always verify wind vectors on Pontoon A before allocating berths to yachts > 20m.',
                successRate: 0.98,
                usageCount: 12
            }
        ];
    }

    async reflect(prompt: string, code: string, result: string, onTrace: (t: AgentTraceLog) => void) {
        if (result.includes('Error')) return;

        const newStrat: PlaybookStrategy = {
            id: `ace_${Date.now()}`,
            domain: 'STARGATE',
            title: `Logic for: ${prompt.substring(0, 20)}`,
            content: `Validated Logic: ${code.substring(0, 50)}... Result: ${result}`,
            successRate: 1.0,
            usageCount: 1
        };

        this.playbook.push(newStrat);
        persistenceService.save(STORAGE_KEY, this.playbook);

        onTrace({
            id: `ace_upd_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            node: 'ada.stargate',
            step: 'ACE_UPDATE',
            content: `New playbook strategy curated: ${newStrat.id}`,
            persona: 'ORCHESTRATOR'
        });
    }

    getRelevantStrategies(input: string): PlaybookStrategy[] {
        return this.playbook.filter(s => 
            input.toLowerCase().includes(s.domain.toLowerCase()) || 
            s.usageCount > 5
        );
    }

    getPlaybookForDomain(domain: string): string {
        const relevant = this.playbook.filter(s => s.domain === domain);
        if (relevant.length === 0) return "No domain specific strategy found.";
        return relevant.map(s => `[${s.title}]: ${s.content}`).join('\n');
    }
}

export const aceService = new ACEService();
