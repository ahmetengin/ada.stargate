
import { AgentAction } from '../../types';
import { persistenceService, STORAGE_KEYS } from '../persistence';
import { TENANT_CONFIG } from '../config';

// Define the interface for a System Update
interface SystemUpdateParams {
    target: 'RULES' | 'THEME' | 'ASSETS' | 'MISSION';
    key: string;
    value: any;
}

export const systemUpdateExpert = {
    
    // Skill: Update Operational Rules (e.g., Change Speed Limit)
    updateRule: async (key: string, value: any): Promise<AgentAction> => {
        console.log(`[SYSTEM] Updating Rule: ${key} -> ${value}`);
        
        // 1. Get Current Config
        const currentConfig = persistenceService.load(STORAGE_KEYS.ACTIVE_TENANT_ID, TENANT_CONFIG);
        
        // 2. Apply Update
        if (!currentConfig.rules) currentConfig.rules = {};
        currentConfig.rules[key] = value;
        
        // 3. Persist (Save to Browser Memory)
        // Note: In a real app, this would POST to backend. Here we hack it into local state.
        // We use a specific key to store "Dynamic Overrides"
        persistenceService.save('dynamic_rules_override', currentConfig.rules);

        return {
            id: `sys_update_${Date.now()}`,
            kind: 'internal',
            name: 'system.ruleUpdated',
            params: { key, value, status: 'APPLIED' }
        };
    },

    // Skill: Emergency Protocol Activation
    setSecurityLevel: async (level: 'GREEN' | 'AMBER' | 'RED'): Promise<AgentAction> => {
        console.log(`[SYSTEM] Setting Security DEFCON: ${level}`);
        
        // Persist level
        persistenceService.save('security_defcon_level', level);

        return {
            id: `sys_sec_${Date.now()}`,
            kind: 'external',
            name: 'system.securityLevelChanged',
            params: { level, timestamp: new Date().toISOString() }
        };
    },

    // Skill: Add New Asset (e.g., Register a new Tender Boat)
    registerAsset: async (assetType: string, assetName: string): Promise<AgentAction> => {
        console.log(`[SYSTEM] Registering new asset: ${assetName} (${assetType})`);
        
        const tenders = persistenceService.load(STORAGE_KEYS.TENDERS, []);
        const newTender = {
            id: `T-${Math.floor(Math.random() * 1000)}`,
            name: assetName,
            status: 'Idle',
            type: assetType,
            assignment: 'Ready'
        };
        
        tenders.push(newTender);
        persistenceService.save(STORAGE_KEYS.TENDERS, tenders);

        return {
            id: `sys_asset_${Date.now()}`,
            kind: 'internal',
            name: 'system.assetRegistered',
            params: { asset: newTender }
        };
    }
};
