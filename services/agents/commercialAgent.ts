
// services/agents/commercialAgent.ts

import { AgentTraceLog, NodeName } from '../../types';
import { wimMasterData } from '../wimMasterData';
import { TaskHandlerFn } from '../decomposition/types';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_com_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

// DEFERRED INITIALIZATION: Wrap the data transformation in a function
const getTenantLeasesData = () => {
    // Use optional chaining for safety. If anything is missing, return [].
    const keyTenants = wimMasterData?.commercial_tenants?.key_tenants || [];
    
    return keyTenants.map((tenant: any, idx: number) => ({
        id: `T-${idx + 100}`,
        name: tenant.name,
        type: tenant.type,
        area: Math.floor(Math.random() * 300) + 100,
        rent: Math.floor(Math.random() * 5000) + 3000,
        status: Math.random() > 0.1 ? 'PAID' : 'OVERDUE',
        next_due: '2025-12-01',
        location: tenant.location
    }));
};

export const commercialExpert = {
    // Skill: Get all tenant lease statuses
    getTenantLeases: async (addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        const leases = getTenantLeasesData(); // Call the function to get data just-in-time
        addTrace(createLog('ada.commercial', 'TOOL_EXECUTION', `Fetching lease data for ${leases.length} commercial tenants from WIM Master Data...`, 'WORKER'));
        return leases;
    },

    // Skill: Calculate and explain Common Area Maintenance (CAM) charges
    calculateCommonCharges: async (tenantId: string, addTrace: (t: AgentTraceLog) => void): Promise<{ message: string }> => {
        const formula = wimMasterData?.commercial_tenants?.common_area_charge_formula || 'N/A';
        addTrace(createLog('ada.commercial', 'THINKING', `Calculating CAM charges based on formula: ${formula}...`, 'EXPERT'));
        
        const leases = getTenantLeasesData();
        const totalCost = 50000;
        const totalLeasedArea = 5000;
        const tenant = leases.find(t => t.id === tenantId) || leases[0];
        if (!tenant) return { message: "Tenant not found." };
        
        const charge = (totalCost / totalLeasedArea) * tenant.area;

        addTrace(createLog('ada.commercial', 'OUTPUT', `CAM for ${tenant.name} is €${charge.toFixed(2)}.`, 'WORKER'));

        const message = `**COMMON AREA MAINTENANCE (CAM) CALCULATION**\n\n` +
                        `Tenant: **${tenant.name}**\n` +
                        `Formula: (Total Cost / Total Area) * Tenant Area\n` +
                        `Calculation: (€${totalCost} / ${totalLeasedArea}m²) * ${tenant.area}m²\n` +
                        `Result: **€${charge.toFixed(2)}** for this period.`;
        return { message };
    },

    // Skill: Analyze Retail Mix
    analyzeRetailMix: async (addTrace: (t: AgentTraceLog) => void): Promise<string> => {
        const leases = getTenantLeasesData();
        const categories = leases.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        addTrace(createLog('ada.commercial', 'THINKING', `Analyzing Retail Tenant Mix...`, 'EXPERT'));
        
        return `**RETAIL MIX ANALYSIS**\n\n` +
               `- F&B: ${categories['F&B'] || 0} Units (High Traffic)\n` +
               `- Wellness: ${categories['Wellness'] || 0} Units\n` +
               `- Market: ${categories['Market'] || 0} Units\n` +
               `- Office: ${categories['Office'] || 0} Units\n\n` +
               `> **Recommendation:** Vacant unit B-04 suitable for 'Marine Electronics' shop to balance the mix.`;
    }
};

// --- Handlers for the Brain ---
export const commercialHandlers: Record<string, TaskHandlerFn> = {
    'commercial.getTenantLeases': async (ctx: any, obs: any) => {
        const result = await commercialExpert.getTenantLeases(() => {});
        return [{
            id: `act_com_leases_${Date.now()}`,
            kind: 'internal',
            name: 'commercial.tenantLeasesResult',
            params: { leases: result }
        }];
    }
};
