
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

// --- REAL WIM TENANT DATA (MOCK DB) ---
const TENANT_LEASES = [
    { id: 'T01', name: 'Poem Restaurant', type: 'F&B', area: 250, rent: 15000, status: 'PAID', next_due: '2025-12-01' },
    { id: 'T02', name: 'West Life Sports Club', type: 'Wellness', area: 800, rent: 25000, status: 'PAID', next_due: '2025-12-01' },
    { id: 'T03', name: 'The Yacht Brokerage', type: 'Office', area: 120, rent: 8000, status: 'OVERDUE', next_due: '2025-11-01' },
    { id: 'T04', name: 'Migros Jet', type: 'Market', area: 400, rent: 12000, status: 'PAID', next_due: '2025-12-01' },
    { id: 'T05', name: 'Fersah Restaurant', type: 'F&B', area: 180, rent: 9000, status: 'PAID', next_due: '2025-12-01' },
];

export const commercialExpert = {
    // Skill: Get all tenant lease statuses
    getTenantLeases: async (addTrace: (t: AgentTraceLog) => void): Promise<any[]> => {
        addTrace(createLog('ada.commercial', 'TOOL_EXECUTION', `Fetching lease data for ${TENANT_LEASES.length} commercial tenants...`, 'WORKER'));
        return TENANT_LEASES;
    },

    // Skill: Calculate and explain Common Area Maintenance (CAM) charges
    calculateCommonCharges: async (tenantId: string, addTrace: (t: AgentTraceLog) => void): Promise<{ message: string }> => {
        addTrace(createLog('ada.commercial', 'THINKING', `Calculating CAM charges based on formula: ${wimMasterData.commercial_tenants.common_area_charge_formula}...`, 'EXPERT'));
        
        // Mock calculation
        const totalCost = 50000; // Total electricity, cleaning, security for common areas
        const totalLeasedArea = 5000;
        const tenant = TENANT_LEASES.find(t => t.id === tenantId) || TENANT_LEASES[0];
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
        const categories = TENANT_LEASES.reduce((acc, t) => {
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
