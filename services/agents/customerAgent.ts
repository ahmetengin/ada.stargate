
// services/agents/customerAgent.ts


import { AgentAction, AgentTraceLog, NodeName, VesselIntelligenceProfile, TenantConfig, CustomerRiskProfile } from '../../types';
import { financeExpert } from './financeAgent';
import { marinaExpert } from './marinaAgent';

// Helper to create a log (copied from orchestratorService.ts for local use)
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});


// A simple, low-cost Knowledge Base for General Inquiries (static, independent of wimMasterData)
const WIM_INFO_DB: Record<string, string> = {
    'arrival': `**West Istanbul Marina - Arrival Procedure**
1.  **VHF Contact:** Before arrival, please call **"West Istanbul Marina"** on VHF Channel **72**.
2.  **Provide Info:** State your vessel's name, length (LOA), beam, and last port of call.
3.  **Follow Pilot:** Our marina tender boat will meet you and guide you to your assigned berth.
4.  **Check-in:** After mooring, please visit the Front Office with your vessel's registration papers, valid insurance policy, and passports/IDs for all crew and passengers.`,
    'wifi': 'Network: **WIM_GUEST** | Pass: **Sailor2025!** (Limit: 5GB/Daily). High-speed Fiber Internet is available on all pontoons.',
    'market': 'Migros Jet: **08:00 - 22:00** (Located behind Block B). Shopping Center also available on-site.',
    'gym': 'Fitness Center: **West Life Sports Club**. Includes Sauna, Indoor & Outdoor Swimming Pools. Tennis, Basketball, and Volleyball courts available.',
    'taxi': 'Taxi Station: +90 212 555 1234 (Gate A pickup). VIP Chauffeur service also available.',
    'pharmacy': 'Pharmacy: "Deniz Eczanesi" located at West Wall mall. Duty pharmacy list available at Security.',
    'restaurant': `**Dining at West Istanbul Marina:**
We offer a diverse culinary experience. Top recommendations:
1. **Calisto Balık:** Premium Seafood & Mezes right on the water.
2. **Ella Italian:** Authentic Italian Pizza & Pasta.
3. **Happy Moon's:** Casual international dining, great for large groups.
4. **Poem:** Fine dining and cocktails.

*Would you like to see a menu or book a table?*`,
    'fuel': 'Fuel Station (Lukoil): 24/7. Duty-free available with 24h notice.',
    'lift': 'Technical: **700 Ton Travel Lift** (Mega Yachts) and **75 Ton Travel Lift** available. 60.000m2 hardstanding area.',
    'parking': 'Parking: Managed by **ISPARK** in strategic partnership with WIM. 550 vehicle capacity. Marina customers receive complimentary exit validation tokens.'
};

export const customerExpert = {
  // Lightweight Processor for General Info
  handleGeneralInquiry: async (query: string, addTrace: (t: AgentTraceLog) => void, tenantConfig: TenantConfig): Promise<{ text: string, actions: AgentAction[] }> => {
    
    addTrace(createLog('ada.customer', 'THINKING', `Searching General Info Database for keywords in: "${query}"`, 'WORKER'));

    const lowerQuery = query.toLowerCase();
    let response = "";
    
    // Check for specific menu requests first using tenantConfig.masterData
    const knownRestaurants = tenantConfig.masterData?.services?.amenities?.restaurants || [];
    const menuForVenueMatch = knownRestaurants.find((r:string) => lowerQuery.includes(r.toLowerCase() + ' menu') || lowerQuery.includes(r.toLowerCase() + ' menü'));

    if (menuForVenueMatch) {
        response = `I do not have real-time access to the menu for **${menuForVenueMatch}**. For their current offerings, please contact the restaurant directly. However, I can assist you with making a reservation.`;
        addTrace(createLog('ada.customer', 'OUTPUT', `Menu request for '${menuForVenueMatch}' handled.`, 'WORKER'));
        return {
            text: response,
            actions: []
        };
    }

    const match = Object.keys(WIM_INFO_DB).find(key => lowerQuery.includes(key));

    if (match) {
        response = WIM_INFO_DB[match];
        addTrace(createLog('ada.customer', 'OUTPUT', `Match found for '${match}'.`, 'WORKER'));
    } else {
        if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('restaurant') || lowerQuery.includes('dinner') || lowerQuery.includes('lunch')) response = WIM_INFO_DB['restaurant'];
        else if (lowerQuery.includes('tech') || lowerQuery.includes('repair') || lowerQuery.includes('lift')) response = WIM_INFO_DB['lift'];
        else if (lowerQuery.includes('park') || lowerQuery.includes('car')) response = WIM_INFO_DB['parking'];
        else response = "Specific info not found. Please contact Front Office (09:00-18:00) for general inquiries.";
        
        addTrace(createLog('ada.customer', 'OUTPUT', `Direct match processed or fallback used.`, 'WORKER'));
    }

    return {
        text: `**ADA CUSTOMER (INFO DESK):**\n${response}`,
        actions: []
    };
  },

  // Skill: Issue Parking Validation
  issueParkingValidation: async (plateNumber: string | null, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string, actions: AgentAction[] }> => {
      const plate = plateNumber || "34 XX 99";
      addTrace(createLog('ada.customer', 'THINKING', `Processing ISPARK Validation request for Plate: ${plate}...`, 'EXPERT'));
      
      const validationCode = `ISP-${Math.floor(Math.random() * 10000)}-WIM`;
      
      addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `Connecting to ISPARK Gateway... Validation Token Generated.`, 'WORKER'));

      const actions: AgentAction[] = [];
      actions.push({
          id: `ispark_val_${Date.now()}`,
          kind: 'external',
          name: 'ada.external.ispark.validate',
          params: { plate, code: validationCode, status: 'VALID' }
      });

      return {
          success: true,
          message: `**PARKING VALIDATED**\n\nVehicle (**${plate}**) authorized for complimentary exit.\n> **Code:** \`${validationCode}\``,
          actions
      };
  },

  // Skill: Get Upcoming Events
  getUpcomingEvents: async (addTrace: (t: AgentTraceLog) => void, tenantConfig: TenantConfig): Promise<any[]> => {
      addTrace(createLog('ada.customer', 'THINKING', `Retrieving Social Calendar from Yacht Club Database...`, 'EXPERT'));
      return tenantConfig.masterData?.event_calendar || [];
  },

  // Skill: Manage Dining Reservations
  manageDiningReservation: async (venueName: string | null, guests: number | null, time: string | null, date: string | null, preOrder: string | null, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string }> => {
      
      const missingInfo = [];
      if (!venueName) missingInfo.push("the restaurant name");
      if (!date) missingInfo.push("the date (e.g., today, tomorrow)");
      if (!time) missingInfo.push("the time");
      if (!guests) missingInfo.push("the number of guests");

      if (missingInfo.length > 0) {
          return { success: false, message: `Certainly! To proceed with the reservation, I just need to know ${missingInfo.join(' and ')}.` };
      }
      
      addTrace(createLog('ada.customer', 'THINKING', `Checking availability at ${venueName} for ${guests} guests at ${time} on ${date}...`, 'EXPERT'));
      
      if (venueName.toLowerCase().includes('can samimiyet') || venueName.toLowerCase().includes('samimiyet')) {
          addTrace(createLog('ada.customer', 'OUTPUT', `Manual Concierge Protocol required for ${venueName}.`, 'WORKER'));
          return { 
              success: true, 
              message: `**CONCIERGE REQUEST RECEIVED**\n\nWe do not have a direct digital link with **${venueName}**, but I have instructed the Concierge Desk to call them immediately on your behalf for **${guests} guests at ${time} on ${date}**.\n\n> **Action:** Calling +90 53X XXX XX XX\n\n*You will receive a confirmation SMS shortly.*` 
          };
      }

      addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `Invoking external reservation API for ${venueName}.`, 'WORKER'));
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, message: `**RESERVATION CONFIRMED**\n\n📍 **Venue:** ${venueName}\n🗓️ **Date:** ${date}\n⏰ **Time:** ${time}\n👥 **Guests:** ${guests}\n\n*Table reserved via Ada.Dining.*` };
  },

  // Skill: Calculate Loyalty Score
  calculateLoyaltyScore: async (imo: string, actionType: string, currentProfile: VesselIntelligenceProfile, addTrace: (t: AgentTraceLog) => void): Promise<{ newScore: number, newTier: any, actions: AgentAction[] }> => {
    let score = currentProfile.loyaltyScore || 500;
    addTrace(createLog('ada.customer', 'THINKING', `Updating loyalty score. Action: ${actionType}`, 'EXPERT'));
    if (actionType === 'PAYMENT_CLEAR') score += 100;
    return { newScore: score, newTier: 'GOLD', actions: [] };
  },

  // NEW SKILL: Evaluate Customer Trust Score (The Judge Logic)
  // Queries other agents to build a full picture
  evaluateCustomerRisk: async (vesselName: string, addTrace: (t: AgentTraceLog) => void): Promise<CustomerRiskProfile> => {
      addTrace(createLog('ada.customer', 'THINKING', `Initiating 360° Risk Analysis for ${vesselName} (Inter-Agent Protocol)...`, 'EXPERT'));

      // 1. Base Score
      let score = 500;
      const breakdown = { financial: 50, operational: 50, commercial: 50, social: 50 }; // Base values out of 100
      const flags: string[] = [];

      // 2. Query Ada.Finance (The Prosecutor)
      const financeStatus = await financeExpert.checkDebt(vesselName);
      if (financeStatus.status === 'CLEAR') {
          score += 150;
          breakdown.financial = 100;
          addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `Ada.Finance: CLEAN LEDGER (+150 Pts).`, 'WORKER'));
      } else {
          score -= 100;
          breakdown.financial = 30;
          flags.push("Late Payer");
          addTrace(createLog('ada.customer', 'WARNING', `Ada.Finance: DEBT DETECTED (€${financeStatus.amount}). (-100 Pts).`, 'WORKER'));
      }

      // 3. Query Ada.Marina (The Witness)
      // Getting vessel profile to check size (Asset Value) and Tenure
      const vesselProfile = await marinaExpert.getVesselIntelligence(vesselName);
      
      if (vesselProfile) {
          // Commercial Value (Spending Power) - Mega Yachts generate more ancillary revenue
          const isMegaYacht = vesselProfile.loa > 30;
          if (isMegaYacht) {
              score += 200;
              breakdown.commercial = 100;
              addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `Ada.Marina: HIGH VALUE ASSET (${vesselProfile.loa}m). (+200 Pts).`, 'WORKER'));
          } else {
              breakdown.commercial = 60;
          }
          
          // Simulated Operational Record
          if (vesselProfile.name.includes("Phisedelia")) {
               // Hardcoded loyalty for demo
               score += 150;
               breakdown.social = 100;
               addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `Ada.Marina: LONG TERM TENANT (>5 Yrs). (+150 Pts).`, 'WORKER'));
          }
      }

      // 4. Determine Segment & Strategy
      let segment: CustomerRiskProfile['segment'] = 'STANDARD';
      
      // CRM Blacklist Check (The Final Veto)
      const blacklistStatus = await customerExpert.checkBlacklistStatus(vesselName, () => {});
      
      if (blacklistStatus.status === 'BLACKLISTED') {
          segment = 'BLACKLISTED';
          score = 0;
          flags.push("CRM: BLACKLISTED");
          addTrace(createLog('ada.customer', 'ERROR', `CRITICAL: Identity '${vesselName}' found in Global Blacklist.`, 'EXPERT'));
      } else {
          // Segmentation Logic
          if (score >= 800) segment = 'WHALE';
          else if (score >= 650) segment = 'VIP';
          else if (score < 400) segment = 'RISKY';
      }

      addTrace(createLog('ada.customer', 'FINAL_ANSWER', `Final Trust Score: ${score}/1000. Segment: ${segment}.`, 'EXPERT'));

      return {
          totalScore: score,
          segment: segment,
          breakdown: breakdown,
          flags: flags,
          lastAssessmentDate: new Date().toISOString().split('T')[0]
      };
  },

  // Skill: Propose "Middle Ground" Solution
  // This is called when a high-value customer has debt.
  proposePaymentPlan: async (vesselName: string, debtAmount: number, addTrace: (t: AgentTraceLog) => void): Promise<{success: boolean, plan: string}> => {
      addTrace(createLog('ada.customer', 'THINKING', `Analyzing 'Middle Way' options for ${vesselName} (Debt: €${debtAmount})...`, 'EXPERT'));
      
      // Check if they are a 'WHALE' or 'VIP' despite the debt
      const riskProfile = await customerExpert.evaluateCustomerRisk(vesselName, addTrace);
      
      if (riskProfile.segment === 'WHALE' || riskProfile.segment === 'VIP') {
           const plan = `**LOYALTY RECOVERY PLAN**\n\n` +
                        `Client is categorized as **${riskProfile.segment}** despite current debt.\n` +
                        `**Proposed Solution:**\n` +
                        `1. **Deferment:** 30-day grace period on current invoice.\n` +
                        `2. **Installments:** Split €${debtAmount} into 3 monthly payments of €${(debtAmount/3).toFixed(2)}.\n` +
                        `3. **Action:** Do NOT block gate access. Send courtesy notification to Captain.`;
           
           addTrace(createLog('ada.customer', 'OUTPUT', `Strategy: RETAIN CLIENT. Payment plan generated.`, 'EXPERT'));
           return { success: true, plan };
      } else {
           const plan = `**STANDARD COLLECTION PROTOCOL**\n\n` +
                        `Client segment is **${riskProfile.segment}**.\n` +
                        `**Proposed Solution:**\n` +
                        `1. **Immediate Payment:** Full balance required.\n` +
                        `2. **Restriction:** Block gate access until cleared.\n` +
                        `3. **Action:** Legal Notice (Article H.2).`;
           
           addTrace(createLog('ada.customer', 'OUTPUT', `Strategy: ENFORCE RULES. No leniency justified.`, 'EXPERT'));
           return { success: true, plan };
      }
  },

  // Skill: Check CRM Status (Blacklist Check)
  checkBlacklistStatus: async (nameOrId: string, addTrace: (t: AgentTraceLog) => void): Promise<{ status: 'ACTIVE' | 'BLACKLISTED', reason?: string }> => {
      // Internal check, simplified logging
      const riskyKeywords = ['problem', 'kara', 'ban', 'illegal', 'istenmeyen'];
      const isBlacklisted = riskyKeywords.some(kw => nameOrId.toLowerCase().includes(kw));

      if (isBlacklisted) {
          const reason = "Persona Non Grata: Previous behavioral incident (Article F.5 violation).";
          return { status: 'BLACKLISTED', reason };
      }
      return { status: 'ACTIVE' };
  }
};
