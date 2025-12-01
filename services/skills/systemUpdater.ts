
import { AgentAction } from '../../types';
import { persistenceService, STORAGE_KEYS } from '../persistence';
import { TENANT_CONFIG } from '../config';

/**
 * ADA SYSTEM UPDATE ADAPTER
 * This service bridges the React Application with the logical skills defined 
 * in `.claude/skills/ada-system-ops/`.
 */

export const systemUpdateExpert = {
    
    // Skill: Update Operational Rules (Mapping to 'update_operational_rule')
    updateRule: async (key: string, value: any): Promise<AgentAction> => {
        console.log(`[SYSTEM] Skill Triggered: update_operational_rule(${key}, ${value})`);
        
        // Logic mirrors .claude/skills/ada-system-ops/index.js
        
        // 1. Get Current Config & Overrides
        const currentRules = persistenceService.load('dynamic_rules_override', {}) || {};
        
        // 2. Apply Update
        currentRules[key] = value;
        
        // 3. Persist
        persistenceService.save('dynamic_rules_override', currentRules);

        // Also update the in-memory TENANT_CONFIG for immediate React reactivity if needed
        if (TENANT_CONFIG.rules) {
            TENANT_CONFIG.rules[key] = value;
        }

        return {
            id: `sys_update_${Date.now()}`,
            kind: 'internal',
            name: 'system.ruleUpdated',
            params: { key, value, status: 'APPLIED' }
        };
    },

    // Skill: Add New Asset (Mapping to 'register_new_asset')
    registerAsset: async (assetType: string, assetName: string): Promise<AgentAction> => {
        console.log(`[SYSTEM] Skill Triggered: register_new_asset(${assetType}, ${assetName})`);
        
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