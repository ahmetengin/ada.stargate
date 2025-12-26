
// services/agents/customerAgent.ts

import { AgentAction, AgentTraceLog, NodeName, VesselIntelligenceProfile, TenantConfig, CustomerRiskProfile, ATSHistoryItem } from '../../types';
import { dmarinMasterData } from '../dmarinMasterData';
import { persistenceService, STORAGE_KEYS } from '../persistence';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_customer_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

// SCORING RULES ENGINE
const SCORING_RULES: Record<string, { delta: number, category: ATSHistoryItem['category'], desc: string }> = {
    // FINANCE (Max 400)
    'INVOICE_PAID_EARLY': { delta: 20, category: 'FINANCE', desc: 'Early payment of invoice' },
    'INVOICE_PAID_ON_TIME': { delta: 5, category: 'FINANCE', desc: 'On-time payment' },
    'LATE_PAYMENT_7_DAYS': { delta: -20, category: 'FINANCE', desc: 'Payment overdue > 7 days' },
    'LATE_PAYMENT_30_DAYS': { delta: -50, category: 'FINANCE', desc: 'Payment overdue > 30 days' },
    'HIGH_SPEND_COMMERCIAL': { delta: 15, category: 'FINANCE', desc: 'High value spending in marina shops' },
    
    // OPERATIONS (Max 300)
    'RULE_VIOLATION_SPEED': { delta: -30, category: 'OPS', desc: 'Speed limit violation in basin' },
    'RULE_VIOLATION_WASTE': { delta: -100, category: 'OPS', desc: 'Illegal discharge / Blue Card missing' },
    'DOCUMENT_MISSING': { delta: -10, category: 'OPS', desc: 'Missing registration documents' },
    'PERFECT_ARRIVAL': { delta: 10, category: 'OPS', desc: 'Seamless arrival protocol compliance' },
    
    // BEHAVIOR (Max 200)
    'RUDE_TO_STAFF': { delta: -40, category: 'BEHAVIOR', desc: 'Reported rude behavior to staff' },
    'POSITIVE_FEEDBACK': { delta: 10, category: 'BEHAVIOR', desc: 'Provided positive feedback' },
    'NOISE_COMPLAINT': { delta: -25, category: 'BEHAVIOR', desc: 'Caused noise disturbance after 23:00' },
    
    // LOYALTY (Max 100)
    'RENEWAL_ANNUAL': { delta: 50, category: 'LOYALTY', desc: 'Annual contract renewal' },
    'REFERRAL': { delta: 30, category: 'LOYALTY', desc: 'Referred a new vessel' }
};

// Initial Mock Data Store
const MOCK_PROFILES: Record<string, CustomerRiskProfile> = {
    'S/Y Phisedelia': {
        totalScore: 850,
        segment: 'PLATINUM',
        breakdown: { financial: 380, operational: 280, behavioral: 150, loyalty: 40 },
        flags: [],
        history: [
            { id: 'h1', date: '2025-11-01', action: 'RENEWAL_ANNUAL', delta: 50, category: 'LOYALTY', description: 'Contract renewed for 2026' },
            { id: 'h2', date: '2025-11-10', action: 'INVOICE_PAID_EARLY', delta: 20, category: 'FINANCE', description: 'Electric invoice paid in 2h' }
        ],
        lastAssessmentDate: new Date().toISOString()
    }
};

export const customerExpert = {
  
  // Skill: Evaluate and Get Current Profile
  evaluateCustomerRisk: async (vesselName: string, addTrace: (t: AgentTraceLog) => void): Promise<CustomerRiskProfile> => {
      addTrace(createLog('ada.customer', 'THINKING', `Retrieving Ada Trust Score (ATS) for ${vesselName}...`, 'EXPERT'));
      
      // Load from persistence or mock
      let profile = MOCK_PROFILES[vesselName];
      
      // If no profile, create a default "Standard" one
      if (!profile) {
          profile = {
              totalScore: 500,
              segment: 'STANDARD',
              breakdown: { financial: 200, operational: 150, behavioral: 100, loyalty: 50 },
              flags: [],
              history: [{ id: `init_${Date.now()}`, date: new Date().toISOString(), action: 'INIT', delta: 500, category: 'OPS', description: 'Initial Assessment' }],
              lastAssessmentDate: new Date().toISOString()
          };
      }

      // Dynamic Segment Recalculation
      if (profile.totalScore >= 900) profile.segment = 'WHALE';
      else if (profile.totalScore >= 750) profile.segment = 'PLATINUM';
      else if (profile.totalScore >= 500) profile.segment = 'STANDARD';
      else if (profile.totalScore >= 300) profile.segment = 'RISKY';
      else profile.segment = 'BLACKLISTED';

      addTrace(createLog('ada.customer', 'OUTPUT', `ATS: ${profile.totalScore} [${profile.segment}]`, 'WORKER'));
      return profile;
  },

  // Skill: Process Interaction Event (The "Live Grading" Logic)
  processInteractionEvent: async (vesselName: string, eventCode: string, addTrace: (t: AgentTraceLog) => void): Promise<{ newScore: number, message: string }> => {
      const rule = SCORING_RULES[eventCode];
      
      if (!rule) {
          addTrace(createLog('ada.customer', 'ERROR', `Unknown event code: ${eventCode}`, 'WORKER'));
          return { newScore: 0, message: "Error" };
      }

      addTrace(createLog('ada.customer', 'THINKING', `Processing Interaction: ${rule.desc} (${rule.delta > 0 ? '+' : ''}${rule.delta} PTS)...`, 'EXPERT'));

      let profile = MOCK_PROFILES[vesselName] || {
          totalScore: 500, segment: 'STANDARD', 
          breakdown: { financial: 200, operational: 150, behavioral: 100, loyalty: 50 }, 
          flags: [], history: [], lastAssessmentDate: new Date().toISOString()
      };

      // Apply Delta
      const oldScore = profile.totalScore;
      profile.totalScore = Math.max(0, Math.min(1000, profile.totalScore + rule.delta));
      
      // Update Breakdown
      if (rule.category === 'FINANCE') profile.breakdown.financial += rule.delta;
      if (rule.category === 'OPS') profile.breakdown.operational += rule.delta;
      if (rule.category === 'BEHAVIOR') profile.breakdown.behavioral += rule.delta;
      if (rule.category === 'LOYALTY') profile.breakdown.loyalty += rule.delta;

      // Add History
      profile.history.unshift({
          id: `evt_${Date.now()}`,
          date: new Date().toISOString(),
          action: eventCode,
          delta: rule.delta,
          category: rule.category,
          description: rule.desc
      });

      // Update Store
      MOCK_PROFILES[vesselName] = profile;

      const direction = profile.totalScore > oldScore ? 'increased' : 'decreased';
      const message = `**CUSTOMER GRADING UPDATED**\n\n` +
                      `Vessel: **${vesselName}**\n` +
                      `Event: ${rule.desc}\n` +
                      `Score: **${oldScore}** -> **${profile.totalScore}** (${direction})\n` +
                      `Current Segment: **${profile.segment}**`;

      addTrace(createLog('ada.customer', 'TOOL_EXECUTION', `ATS Updated. New Score: ${profile.totalScore}. Database synced.`, 'WORKER'));

      return { newScore: profile.totalScore, message };
  },

  // Skill: Calculate Loyalty Score & Global Benefits (Legacy Wrapper)
  calculateLoyaltyScore: async (imo: string, actionType: string, currentProfile: VesselIntelligenceProfile, addTrace: (t: AgentTraceLog) => void): Promise<{ newScore: number, newTier: any, actions: AgentAction[] }> => {
    // This now delegates to the main scoring engine internally
    let score = currentProfile.loyaltyScore || 500;
    if (actionType === 'PAYMENT_CLEAR') {
        const res = await customerExpert.processInteractionEvent(currentProfile.name, 'INVOICE_PAID_ON_TIME', addTrace);
        score = res.newScore;
    }
    return { newScore: score, newTier: 'STANDARD', actions: [] };
  },

  // ... (Keep existing methods like recommendNextDestination)
  recommendNextDestination: async (currentMarinaId: string, addTrace: (t: AgentTraceLog) => void): Promise<string> => {
      // ... existing logic ...
      return "D-Marin Dubai Harbour"; 
  },

  handleGeneralInquiry: async (query: string, addTrace: (t: AgentTraceLog) => void, tenantConfig: TenantConfig): Promise<{ text: string, actions: AgentAction[] }> => {
      // ... existing logic ...
      return { text: "Response", actions: [] };
  }
};
