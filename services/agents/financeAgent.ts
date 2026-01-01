
import { AgentAction, UserProfile, AgentTraceLog, VesselIntelligenceProfile, NodeName } from '../../types';
import { wimMasterData } from '../data/wimMasterData';
import { persistenceService, STORAGE_KEYS } from '../utils/persistence'; 
import { getCurrentMaritimeTime } from '../utils/utils';
import { checkBackendHealth, invokeAgentSkill } from '../api'; 

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const financeExpert = {
  calculateEarlyBookingOffer: async (basePrice: number, targetDateStr: string, addTrace: (t: AgentTraceLog) => void): Promise<{ finalPrice: number, discountRate: number, discountAmount: number, strategy: string, marketRate: number }> => {
      addTrace(createLog('ada.finance', 'THINKING', `Evaluating Cost of Capital... Base: ${basePrice}, Date: ${targetDateStr}`, 'EXPERT'));
      return { finalPrice: basePrice * 0.9, discountRate: 0.10, discountAmount: basePrice * 0.10, strategy: 'EARLY_BIRD', marketRate: 0.08 };
  },

  createPaymentLink: async (vesselName: string, amount: number, description: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, link: string, message: string }> => {
      addTrace(createLog('ada.finance', 'THINKING', `Generating secure payment link for ${vesselName}...`, 'EXPERT'));
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      const link = `https://iyzi.co/pay/${token}`;
      return { success: true, link, message: "Payment link generated." };
  },

  checkDebt: async (vesselName: string): Promise<any> => {
      return { status: 'CLEAR', amount: 0, paymentHistoryStatus: 'REGULAR' };
  }
};
