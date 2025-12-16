
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { TaskHandlerFn } from '../decomposition/types';
import { berthExpert } from './berthAgent'; 
import { financeExpert } from './financeAgent'; // Updated: Call Finance for Dynamic Price
import { passkitExpert } from './passkitAgent'; // Import PassKit

// Helper to create a log
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_res_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const reservationsExpert = {
    
    // Skill: Process Booking Request (Public Facing)
    processBooking: async (vesselSpecs: { name: string, type: string, loa: number, beam: number }, dates: { start: string, end: string }, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, proposal?: any, actions: AgentAction[] }> => {
        
        addTrace(createLog('ada.reservations', 'THINKING', `Processing booking request for ${vesselSpecs.name} (${dates.start} to ${dates.end})...`, 'EXPERT'));

        // 1. Call Berth Expert for Assignment
        const assignment = await berthExpert.findOptimalBerth({ 
            loa: vesselSpecs.loa, 
            beam: vesselSpecs.beam, 
            draft: 3.0, // Default draft if unknown
            type: vesselSpecs.type 
        }, addTrace);

        // 2. Base Price Calculation
        const days = 5; // Simplified duration calc
        const baseCost = (assignment.priceQuote || 0) * days;

        // 3. Dynamic Pricing (Pre-paid Sales Financing Check)
        // We pass the start date to Finance to check if it's far enough in the future for a discount based on Cost of Capital
        const pricing = await financeExpert.calculateEarlyBookingOffer(baseCost, dates.start, addTrace);
        const finalCost = pricing.finalPrice;

        // 4. Determine Expiration (The "Trick" - Urgency)
        // If there is a discount strategy applied, make the offer expire sooner (e.g. 24h)
        const expirationHours = pricing.discountRate > 0 ? 24 : 48;
        const expirationTime = new Date(Date.now() + (expirationHours * 60 * 60 * 1000)).toLocaleString();

        // 5. Issue PROVISIONAL Pass (Grey Pass)
        const passResult = await passkitExpert.issueTravelPass({
            passenger: vesselSpecs.name, 
            type: 'HOTEL', // Using HOTEL type for Marina Stay
            summary: `Berth: ${assignment.berth} (${dates.start})`,
            date: dates.start,
            status: 'PENDING',
            expiration: expirationTime // Pass the specific expiration
        }, addTrace);

        addTrace(createLog('ada.reservations', 'TOOL_EXECUTION', `Generated Provisional PNR: ${passResult.pnr}. Expires: ${expirationHours}h.`, 'WORKER'));

        const actions: AgentAction[] = [];
        
        // Action to show the PENDING pass
        actions.push({
            id: `passkit_prov_${Date.now()}`,
            kind: 'external',
            name: 'ada.passkit.generated',
            params: { passUrl: passResult.passUrl }
        });

        // Trigger Finance Invoice Creation immediately
        actions.push({
            id: `fin_create_inv_${Date.now()}`,
            kind: 'external',
            name: 'ada.finance.createInvoice', // Maps to finance flow
            params: {
                intent: 'create_invoice',
                vesselName: vesselSpecs.name,
                amount: finalCost,
                serviceType: 'MOORING'
            }
        });

        let message = `**RESERVATION HELD (PROVISIONAL)**\n\n` +
                        `**Vessel:** ${vesselSpecs.name}\n` +
                        `**PNR:** \`${passResult.pnr}\`\n` +
                        `**Assignment:** ${assignment.berth}\n\n`;

        if (pricing.discountRate > 0) {
            message += `🎉 **PRE-PAID SALES FINANCING APPLIED**\n` +
                       `We prefer to finance our operations through our customers rather than banks.\n` +
                       `Current Market Loan Rate: **${(pricing.marketRate * 100).toFixed(2)}%**\n` +
                       `**Your Savings (Discount):** €${pricing.discountAmount.toFixed(2)} (-${(pricing.discountRate * 100).toFixed(1)}%)\n` +
                       `*Valid for Immediate Cash Settlement.*\n\n` +
                       `**Total Due: €${finalCost.toFixed(2)}**\n\n`;
        } else {
            message += `**Total Due: €${finalCost.toFixed(2)}**\n\n`;
        }

        message += `**OFFER EXPIRES:** ${expirationTime} (${expirationHours} Hours)\n` +
                   `I have issued a **Pending Boarding Pass** to your wallet. Unpaid reservations are released automatically.`;

        return {
            success: true,
            message: message,
            proposal: { ...assignment, totalCost: finalCost },
            actions: actions
        };
    }
};

// --- Handlers ---
export const reservationsHandlers: Record<string, TaskHandlerFn> = {
    'reservations.create': async (ctx: any, obs: any) => {
        const { vessel, dates } = obs.payload;
        const res = await reservationsExpert.processBooking(vessel, dates, () => {});
        return res.actions;
    }
};
