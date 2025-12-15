
// services/agents/customerAgent.ts

import { AgentAction, AgentTraceLog, NodeName, VesselIntelligenceProfile, TenantConfig, CustomerRiskProfile } from '../../types';
import { financeExpert } from './financeAgent';
import { marinaExpert } from './marinaAgent';
import { dmarinMasterData } from '../dmarinMasterData';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const customerExpert = {
  
  // Skill: Calculate Loyalty Score & Global Benefits
  calculateLoyaltyScore: async (imo: string, actionType: string, currentProfile: VesselIntelligenceProfile, addTrace: (t: AgentTraceLog) => void): Promise<{ newScore: number, newTier: any, actions: AgentAction[] }> => {
    let score = currentProfile.loyaltyScore || 500;
    
    // D-Marin Logic
    const program = dmarinMasterData.loyalty_program;
    let tier = 'STANDARD';
    
    if (score > 1000) tier = 'PREMIUM';
    if (score > 5000) tier = 'PLATINUM';

    // Type casting because we know the structure of dmarinMasterData
    const benefits = (program as any).tiers[tier].benefits;

    addTrace(createLog('ada.customer', 'THINKING', `Analyzing 'Happy Berth Days' eligibility for ${currentProfile.name} (Global Network)...`, 'EXPERT'));
    
    if (tier !== 'STANDARD') {
        addTrace(createLog('ada.customer', 'OUTPUT', `Vessel eligible for 7 Days Free Berthing at any D-Marin marina globally.`, 'WORKER'));
    }

    if (actionType === 'PAYMENT_CLEAR') score += 100;
    
    return { newScore: score, newTier: tier, actions: [] };
  },

  // NEW SKILL: Global Network Routing (The "Concierge" for Cross-Border)
  recommendNextDestination: async (currentMarinaId: string, addTrace: (t: AgentTraceLog) => void): Promise<string> => {
      addTrace(createLog('ada.customer', 'THINKING', `Analyzing D-Marin network for next destination from ${currentMarinaId}...`, 'EXPERT'));
      
      // Logic: Suggest nearby D-Marin marinas
      let suggestion = "";
      
      if (currentMarinaId.includes('TUR')) {
          suggestion = "How about **D-Marin Didim**? It's a short sail south, and we have a special event at the Yacht Club this weekend.";
      } else if (currentMarinaId.includes('DID')) {
          suggestion = "**D-Marin Göcek** offers excellent shelter and access to the 12 Islands. Perfect for the weekend.";
      } else if (currentMarinaId.includes('GOU')) {
          suggestion = "**D-Marin Lefkas** is nearby in the Ionian Sea. Great sailing conditions forecasted.";
      } else {
          suggestion = "Have you considered **D-Marin Dubai Harbour** for the winter season? We can arrange transport.";
      }

      return suggestion;
  },

  evaluateCustomerRisk: async (vesselName: string, addTrace: (t: AgentTraceLog) => void): Promise<CustomerRiskProfile> => {
      addTrace(createLog('ada.customer', 'THINKING', `Calculating Ada Trust Score (ATS) for ${vesselName}...`, 'EXPERT'));
      
      // Mock calculation logic for demo
      // In production this would query CRM
      const score = Math.floor(Math.random() * 500) + 500;
      let segment: CustomerRiskProfile['segment'] = 'STANDARD';
      if (score > 800) segment = 'WHALE';
      else if (score > 700) segment = 'VIP';
      else if (score < 400) segment = 'RISKY';

      const profile: CustomerRiskProfile = {
          totalScore: score,
          segment: segment,
          breakdown: {
              financial: Math.floor(Math.random() * 100),
              operational: Math.floor(Math.random() * 100),
              commercial: Math.floor(Math.random() * 100),
              social: Math.floor(Math.random() * 100)
          },
          flags: score < 400 ? ['Late Payment'] : [],
          lastAssessmentDate: new Date().toISOString()
      };

      addTrace(createLog('ada.customer', 'OUTPUT', `Risk Assessment: ${profile.segment} (${profile.totalScore})`, 'WORKER'));
      return profile;
  },

  handleGeneralInquiry: async (query: string, addTrace: (t: AgentTraceLog) => void, tenantConfig: TenantConfig): Promise<{ text: string, actions: AgentAction[] }> => {
      // Simplified D-Marin Inquiry Handler
      addTrace(createLog('ada.customer', 'THINKING', `Processing Global Inquiry: "${query}"`, 'WORKER'));
      
      let response = "I can assist with that request across our global network.";
      
      if (query.toLowerCase().includes('wifi')) {
          response = "Global Wi-Fi: **D-Marin_Guest** | Password: **ConnectedMarina2025** (Valid in all 26 marinas).";
      } else if (query.toLowerCase().includes('gym')) {
          response = "Our fitness facilities vary by location. In **Turgutreis**, we have a full spa. In **Dubai**, we partner with neighboring 5-star hotels.";
      }

      return { text: response, actions: [] };
  }
};
