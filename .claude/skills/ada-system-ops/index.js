/**
 * ADA SYSTEM OPERATIONS SKILL
 * 
 * Capability: Modifies the runtime configuration of the Ada Stargate OS.
 * Context: Client-Side (Browser Memory / LocalStorage).
 */

const STORAGE_KEYS = {
    TENDERS: 'ada_tenders_v1',
    TENANT: 'active_tenant_id',
    DYNAMIC_RULES: 'dynamic_rules_override'
};

// Helper to interact with LocalStorage (Browser context)
const getStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
};

const setStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) { return false; }
};

module.exports = {
    /**
     * Updates a specific operational rule (e.g., Speed Limit).
     * @param {string} ruleKey - The rule identifier (e.g., 'speed_limit_knots')
     * @param {any} value - The new value
     */
    updateRule: async (ruleKey, value) => {
        console.log(`[SKILL:SystemOps] Patching Rule: ${ruleKey} = ${value}`);
        
        // 1. Load existing overrides
        let currentRules = getStorage(STORAGE_KEYS.DYNAMIC_RULES) || {};
        
        // 2. Apply patch
        currentRules[ruleKey] = value;
        
        // 3. Save
        setStorage(STORAGE_KEYS.DYNAMIC_RULES, currentRules);
        
        return {
            status: "SUCCESS",
            message: `Rule '${ruleKey}' updated to '${value}'. System effective immediately.`,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Registers a new physical asset to the fleet.
     * @param {string} type - 'Tender', 'JetSki', 'Patrol'
     * @param {string} name - Callsign
     */
    registerAsset: async (type, name) => {
        console.log(`[SKILL:SystemOps] Registering Asset: ${name}`);
        
        let assets = getStorage(STORAGE_KEYS.TENDERS) || [];
        
        const newAsset = {
            id: `${type.substring(0,1).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
            name: name,
            type: type,
            status: 'Idle',
            assignment: 'Ready for Service'
        };
        
        assets.push(newAsset);
        setStorage(STORAGE_KEYS.TENDERS, assets);
        
        return {
            status: "SUCCESS",
            asset_id: newAsset.id,
            details: newAsset
        };
    }
};