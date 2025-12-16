
// services/agents/financeAgent.ts

import { AgentAction, UserProfile, AgentTraceLog, VesselIntelligenceProfile, NodeName } from '../../types';
import { wimMasterData } from '../wimMasterData';
import { persistenceService, STORAGE_KEYS } from '../persistence'; // Enterprise Persistence
import { getCurrentMaritimeTime } from '../utils';
import { checkBackendHealth, invokeAgentSkill } from '../api'; // Import API helpers
import { passkitExpert } from './passkitAgent'; // Import PassKit for updates

// Helper to create a log
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

// Type alias for clarity and consistency
type PaymentHistoryStatus = Exclude<VesselIntelligenceProfile['paymentHistoryStatus'], undefined>;

type LedgerEntry = { balance: number, paymentHistoryStatus?: PaymentHistoryStatus };

// Mock API integrations for Paraşüt, Iyzico, and Garanti BBVA
const PARASUT_API_MOCK = {
    // Store as Map in memory, but convert to Array for JSON storage
    vesselLedger: new Map<string, LedgerEntry>(),
    // NEW: Partner Ledger for Commissions (Restaurants, Agencies)
    partnerLedger: new Map<string, number>(),

    init: () => {
        // Load from storage or use default
        const defaultLedger: [string, LedgerEntry][] = [
            ['s/y phisedelia', { balance: 850, paymentHistoryStatus: 'RECENTLY_LATE' }],
            ['m/y blue horizon', { balance: 0, paymentHistoryStatus: 'REGULAR' }]
        ];
        
        const loadedLedger = persistenceService.load<[string, LedgerEntry][]>(STORAGE_KEYS.FINANCE_LEDGER, defaultLedger);
        PARASUT_API_MOCK.vesselLedger = new Map(loadedLedger);

        // Mock Partner Commissions (Accumulated)
        PARASUT_API_MOCK.partnerLedger.set('Poem Restaurant', 450); // 450 EUR Accumulated Commission
        PARASUT_API_MOCK.partnerLedger.set('Fersah', 120);
        PARASUT_API_MOCK.partnerLedger.set('Kites Travel', 1500);
    },

    save: () => {
        const entries = Array.from(PARASUT_API_MOCK.vesselLedger.entries());
        persistenceService.save(STORAGE_KEYS.FINANCE_LEDGER, entries);
    },
    
    createInvoice: (client: string, items: any[], type: 'VESSEL' | 'PARTNER' = 'VESSEL') => {
        const total = items.reduce((acc: number, item: any) => acc + item.price, 0);
        return { 
            id: `INV-${type === 'VESSEL' ? 'V' : 'P'}-${Math.floor(Math.random()*10000)}`, 
            provider: 'PARASUT', 
            status: 'DRAFT', 
            amount: total,
            items: items,
            clientName: client
        };
    },
    
    getBalance: (vesselName: string): { balance: number; currency: 'EUR'; paymentHistoryStatus?: PaymentHistoryStatus } => {
        const vesselData = PARASUT_API_MOCK.vesselLedger.get(vesselName.toLowerCase());
        if (vesselData) {
            return { balance: vesselData.balance, currency: 'EUR', paymentHistoryStatus: vesselData.paymentHistoryStatus };
        }
        // Default when vessel not found
        return { balance: 0, currency: 'EUR', paymentHistoryStatus: 'REGULAR' as PaymentHistoryStatus }; 
    },

    updateBalance: (vesselName: string, newBalance: number, newPaymentHistoryStatus: PaymentHistoryStatus) => {
        PARASUT_API_MOCK.vesselLedger.set(vesselName.toLowerCase(), { balance: newBalance, paymentHistoryStatus: newPaymentHistoryStatus });
        PARASUT_API_MOCK.save(); // Persist immediately
    },

    // Partner Methods
    getPartnerCommission: (partnerName: string) => {
        return PARASUT_API_MOCK.partnerLedger.get(partnerName) || 0;
    },
    
    clearPartnerCommission: (partnerName: string) => {
        PARASUT_API_MOCK.partnerLedger.set(partnerName, 0);
    }
};

// Initialize Ledger on Load
PARASUT_API_MOCK.init();

const IYZICO_API_MOCK = {
    createPaymentLink: (invoiceId: string, amount: number, vesselName: string) => {
        return { 
            id: `PAY-${Date.now()}`, 
            provider: 'IYZICO', 
            url: `https://iyzi.co/pay/${invoiceId}?vessel=${encodeURIComponent(vesselName)}`, 
            status: 'PENDING' 
        };
    }
};

const GARANTI_BBVA_API_MOCK = {
    fetchTransactions: (startDate: Date, endDate: Date) => {
        // Simulate some payments coming in from different vessels
        const transactions = [];
        if (Math.random() > 0.5) { // Simulate a payment for Blue Horizon
            transactions.push({
                transactionId: `TRN-BBVA-${Date.now()}-1`,
                date: new Date().toISOString().split('T')[0],
                amount: 1200.00,
                currency: 'EUR',
                type: 'CREDIT',
                description: 'Mooring payment for M/Y Blue Horizon',
                reference: 'INV-0002',
                vesselImo: '123456789' // Assumed IMO for M/Y Blue Horizon
            });
        }
        if (Math.random() > 0.7) { // Simulate a payment for S/Y Phisedelia
            transactions.push({
                transactionId: `TRN-BBVA-${Date.now()}-2`,
                date: new Date().toISOString().split('T')[0],
                amount: 850.00, // Exact outstanding debt
                currency: 'EUR',
                type: 'CREDIT',
                description: 'Overdue payment for S/Y Phisedelia',
                reference: 'INV-0001',
                vesselImo: '987654321' // Assumed IMO for S/Y Phisedelia
            });
        }
        return transactions;
    }
}


export const financeExpert = {
  // Helper for Orchestrator Fast-Path
  checkDebt: async (vesselName: string): Promise<{ status: 'CLEAR' | 'DEBT', amount: number, paymentHistoryStatus: PaymentHistoryStatus }> => {
      
      // 1. Hybrid Check: Try Python Backend first
      const isBackendUp = await checkBackendHealth();
      if (isBackendUp) {
          const remoteStatus = await invokeAgentSkill('finance', 'check_debt', { vessel_name: vesselName });
          if (remoteStatus) {
              console.log(`[Finance] Retrieved authoritative debt record from Backend for ${vesselName}.`);
              return {
                  status: remoteStatus.balance > 0 ? 'DEBT' : 'CLEAR',
                  amount: remoteStatus.balance,
                  paymentHistoryStatus: remoteStatus.payment_history_status || 'REGULAR'
              };
          }
      }

      // 2. Local Simulation Fallback
      const data = PARASUT_API_MOCK.getBalance(vesselName);
      return { 
          status: data.balance > 0 ? 'DEBT' : 'CLEAR', 
          amount: data.balance,
          paymentHistoryStatus: data.paymentHistoryStatus ?? 'REGULAR' // Ensure it's never undefined
      };
  },

  // NEW SKILL: Cost of Capital Based Financing (Pre-paid Sales Financing)
  // Instead of static rules, we compare the discount against the cost of a bank loan.
  calculateEarlyBookingOffer: async (basePrice: number, targetDateStr: string, addTrace: (t: AgentTraceLog) => void): Promise<{ finalPrice: number, discountRate: number, discountAmount: number, strategy: string, marketRate: number }> => {
      addTrace(createLog('ada.finance', 'THINKING', `Evaluating Cost of Capital vs. Early Payment for Target Date: ${targetDateStr}...`, 'EXPERT'));
      
      const today = new Date();
      const targetDate = new Date(targetDateStr);
      
      // Calculate lead time in years (fractional)
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const diffYears = diffDays / 365;

      if (diffDays < 30) {
          // Too close for financing logic
           addTrace(createLog('ada.finance', 'OUTPUT', `Lead time too short (${diffDays} days). No financing advantage via banking alternatives.`, 'WORKER'));
           return { finalPrice: basePrice, discountRate: 0, discountAmount: 0, strategy: 'STANDARD_RATE', marketRate: 0 };
      }

      // 1. Get Live Market Rates (Simulated Bloomberg/Central Bank Feed)
      // High volatility simulation for EUR commercial loans in TR context
      // Base: 3.8% (Euribor) + Risk Spread (4.5%) = ~8.3%
      const baseEuribor = 0.038; 
      const bankSpread = 0.045;  
      const currentCommercialLoanRate = baseEuribor + bankSpread; 
      
      addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Fetching Market Rates: EURIBOR 3.8% + Bank Spread 4.5% = **${(currentCommercialLoanRate*100).toFixed(2)}% Annual Cost of Capital**`, 'WORKER'));

      // 2. Calculate Cost of Borrowing this amount from Bank
      // If we don't get this money from the customer now, we have to borrow it to maintain liquidity.
      // Simple Interest Formula: Cost = Principal * Rate * Time
      const costOfBankCapital = basePrice * currentCommercialLoanRate * diffYears;

      // 3. Determine "Win-Win" Discount
      // We give the customer a discount that is slightly LESS than our bank cost, but enough to be attractive.
      // Strategy: Split the bank interest saving. 80% to customer (Discount), 20% to Marina (Net Profit Increase).
      // This ensures the company is MORE profitable than taking a loan.
      const maxViableDiscount = costOfBankCapital;
      const proposedDiscountAmount = maxViableDiscount * 0.90; // Passing 90% of the saving to secure the cash.
      
      let discountRate = proposedDiscountAmount / basePrice;
      const finalPrice = basePrice - proposedDiscountAmount;

      // Cap discount reasonably (e.g. don't give 50% even if rates are crazy high, unless explicitly authorized)
      if (discountRate > 0.40) {
          addTrace(createLog('ada.finance', 'WARNING', `Calculated discount ${(discountRate*100).toFixed(1)}% exceeds safety cap. Clamping to 40%.`, 'WORKER'));
          discountRate = 0.40;
      }

      const strategy = `PREPAID_FINANCING_EUR_${(currentCommercialLoanRate*100).toFixed(1)}%`;

      addTrace(createLog('ada.finance', 'PLANNING', `Logic: Borrowing €${basePrice.toFixed(0)} for ${diffDays} days costs us €${costOfBankCapital.toFixed(0)}. Offering €${proposedDiscountAmount.toFixed(0)} discount allows us to bypass the bank and increase net liquidity.`, 'EXPERT'));
      
      addTrace(createLog('ada.finance', 'OUTPUT', `**FINANCING PROPOSAL GENERATED:**\nMarket Rate: ${(currentCommercialLoanRate*100).toFixed(2)}%\nDiscount: ${(discountRate*100).toFixed(2)}%\nSaving: €${proposedDiscountAmount.toFixed(2)}`, 'WORKER'));

      return { finalPrice, discountRate, discountAmount: proposedDiscountAmount, strategy, marketRate: currentCommercialLoanRate };
  },

  // Helper to get all partner commissions for GM Dashboard
  getPartnerCommissions: async (): Promise<{partner: string, amount: number}[]> => {
      const commissions: {partner: string, amount: number}[] = [];
      PARASUT_API_MOCK.partnerLedger.forEach((amount, partner) => {
          commissions.push({ partner, amount });
      });
      return commissions;
  },

  // Skill: Process an incoming payment (e.g., from Iyzico webhook or manual confirmation)
  processPayment: async (vesselName: string, paymentRef: string, amount: number, addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
      addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Confirming payment for ${vesselName} (Ref: ${paymentRef}, Amount: €${amount})...`, 'WORKER'));

      const actions: AgentAction[] = [];
      actions.push({
          id: `fin_pay_conf_${Date.now()}`,
          kind: 'internal',
          name: 'ada.finance.paymentConfirmed',
          params: { vesselName, paymentRef, amount, status: 'SUCCESS' }
      });

      // Trigger customer agent for loyalty score update
      actions.push({
          id: `cust_loyalty_update_${Date.now()}`,
          kind: 'internal',
          name: 'ada.customer.calculateLoyaltyScore',
          params: { vesselName, actionType: 'PAYMENT_CLEAR' }
      });

      // Trigger marina agent to update vessel profile (e.g., debt status)
      actions.push({
          id: `marina_profile_update_${Date.now()}`,
          kind: 'internal',
          name: 'ada.marina.updateVesselProfile',
          params: { 
              vesselName, 
              update: { 
                  outstandingDebt: 0, 
                  paymentHistoryStatus: 'REGULAR' // Force to REGULAR after payment
              } 
          }
      });

      // UPDATED: TRIGGER PASSKIT UPDATE
      // Instead of issuing a new pass, we "update" the status of the reservation/pass associated with this vessel.
      // In a real system, we'd look up the exact PNR. Here we assume the most recent one.
      await passkitExpert.updatePassStatus("PENDING_PNR", "CONFIRMED", addTrace);
      
      actions.push({
          id: `passkit_update_${Date.now()}`,
          kind: 'external',
          name: 'ada.passkit.generated', // Reuse existing UI hook but with updated status
          params: {
              passUrl: `https://wallet.kites.travel/pass/UPDATED?status=CONFIRMED`, // Simulation
              status: 'CONFIRMED'
          }
      });

      // NOTE: The balance update happens where this function is called or via reconciliation logic usually.
      // But for immediate processing:
      const currentBalanceData = PARASUT_API_MOCK.getBalance(vesselName);
      PARASUT_API_MOCK.updateBalance(vesselName, Math.max(0, currentBalanceData.balance - amount), 'REGULAR');

      return actions;
  },

  // Skill: Fetch daily bank settlement from Garanti BBVA
  fetchDailySettlement: async (addTrace: (t: AgentTraceLog) => void): Promise<{ text: string, actions: AgentAction[] }> => {
      addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Fetching daily transactions from Garanti BBVA API...`, 'WORKER'));

      const today = new Date();
      const transactions = GARANTI_BBVA_API_MOCK.fetchTransactions(today, today);
      const actions: AgentAction[] = [];
      let totalSettledAmount = 0;
      let settlementReport = `**DAILY SETTLEMENT REPORT (${today.toLocaleDateString()}):**\n\n`;
      settlementReport += `Received ${transactions.length} payments:\n`;

      if (transactions.length === 0) {
          settlementReport += `*No new payments received today.*\n`;
      } else {
          for (const tx of transactions) {
              settlementReport += `- **€${tx.amount}** for ${tx.description}\n`;
              const vesselNameMatch = tx.description.match(/for (S\/Y|M\/Y|Catamaran) ([A-Za-z ]+)/i);
              const vesselName = vesselNameMatch ? vesselNameMatch[2].trim() : `Vessel (IMO:${tx.vesselImo})`;
              
              if (vesselName) {
                  addTrace(createLog('ada.finance', 'PLANNING', `Reconciling payment for ${vesselName} (Ref: ${tx.transactionId})...`, 'EXPERT'));
                  
                  // This call internally updates the balance and triggers actions (including PassKit)
                  const processPaymentActions = await financeExpert.processPayment(vesselName, tx.transactionId, tx.amount, addTrace);
                  actions.push(...processPaymentActions);
                  totalSettledAmount += tx.amount;
              } else {
                  addTrace(createLog('ada.finance', 'ERROR', `Could not identify vessel for transaction ${tx.transactionId}. Manual reconciliation required.`, 'EXPERT'));
              }
          }
          settlementReport += `\n**Total Settled: €${totalSettledAmount.toFixed(2)}**`;
      }


      return { text: settlementReport, actions: actions };
  },

  // Skill: Generate Insurance Quote (The Safety Net Protocol)
  generateInsuranceQuote: async (vesselName: string, vesselValue: number, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, quotes: any[], message: string }> => {
      addTrace(createLog('ada.finance', 'THINKING', `Generating Hull & Machinery Insurance Quotes for ${vesselName} (Val: €${vesselValue})...`, 'EXPERT'));
      
      // Simulate API call to Insurance Partners
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate premiums (approx 0.6% - 0.8%)
      const turkPniQuote = Math.round(vesselValue * 0.0065);
      const allianzQuote = Math.round(vesselValue * 0.0072);
      
      const quotes = [
          { provider: 'Turk P&I', premium: turkPniQuote, currency: 'EUR', coverage: 'Full Hull & Machinery + P&I', deductible: '1%' },
          { provider: 'Allianz', premium: allianzQuote, currency: 'EUR', coverage: 'Comprehensive + Wreck Removal', deductible: '0.5%' }
      ];

      addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Received ${quotes.length} quotes from Broker API. Best offer: Turk P&I (€${turkPniQuote}).`, 'WORKER'));

      return {
          success: true,
          quotes: quotes,
          message: `**INSURANCE RENEWAL PROPOSAL**\n\nBased on your vessel profile, I have negotiated the following renewal terms:\n\n1. **Turk P&I:** €${turkPniQuote} (Recommended - Best Value)\n2. **Allianz:** €${allianzQuote} (Premium Coverage)\n\nWould you like me to prepare the policy binder?`
      };
  },

  // Skill: Invoice Engine (Handles both Vessel and Partner Invoices)
  process: async (params: any, user: UserProfile, addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
    const actions: AgentAction[] = [];
    
    // RBAC Check: Finance data is sensitive
    if (user.role === 'VISITOR') {
        addTrace(createLog('ada.finance', 'ERROR', `Access Denied: User role '${user.role}' lacks clearance for Financial Operations.`, 'EXPERT'));
        return [{
            id: `fin_deny_${Date.now()}`,
            kind: 'internal',
            name: 'ada.finance.accessDenied',
            params: { reason: 'Insufficient Clearance' }
        }];
    }

    const { intent, vesselName, partnerName, beneficiary, amount, serviceType } = params;

    // --- PARTNER COMMISSION MANAGEMENT ---
    if (intent === 'invoice_partner') {
        const commission = PARASUT_API_MOCK.getPartnerCommission(partnerName);
        if (commission <= 0) return actions;

        addTrace(createLog('ada.finance', 'THINKING', `Generating B2B Commission Invoice for ${partnerName} (Amount: €${commission})...`, 'EXPERT'));
        
        const invoice = PARASUT_API_MOCK.createInvoice(partnerName, [
            { description: 'Monthly Referral Commission (October 2025)', price: commission }
        ], 'PARTNER');
        
        PARASUT_API_MOCK.clearPartnerCommission(partnerName);

        actions.push({
            id: `fin_inv_partner_${Date.now()}`,
            kind: 'external',
            name: 'ada.finance.partnerInvoiceGenerated',
            params: { invoice }
        });
    }

    if (intent === 'gift_commission') {
        const commission = PARASUT_API_MOCK.getPartnerCommission(partnerName);
        if (commission <= 0) return actions;

        addTrace(createLog('ada.finance', 'THINKING', `Converting ${partnerName}'s commission (€${commission}) into Loyalty Gift for ${beneficiary}...`, 'EXPERT'));
        
        // Burn commission
        PARASUT_API_MOCK.clearPartnerCommission(partnerName);

        // Trigger Gift Action
        actions.push({
            id: `fin_gift_${Date.now()}`,
            kind: 'external',
            name: 'ada.customer.issueGiftVoucher',
            params: {
                beneficiary: beneficiary,
                amount: commission,
                source: `Commission Pool (${partnerName})`,
                description: `Complimentary Dinner Voucher at ${partnerName}`
            }
        });
    }

    // --- VESSEL INVOICING ---
    if (intent === 'create_invoice') {
        addTrace(createLog('ada.finance', 'THINKING', `Calculating fees for ${vesselName} (Service: ${serviceType || 'General Debt'})...`, 'EXPERT'));

        // Dynamic Item Generation based on service type
        let items = [];
        if (serviceType === 'MOORING') {
             items.push({ description: 'Daily Mooring Fee (150m2)', price: 225 });
             items.push({ description: 'Utility Connection Fee', price: 50 });
        } else {
             items.push({ description: 'Outstanding Balance Transfer', price: amount || 100 });
        }

        addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Connecting to PARASUT API... Creating invoice for ${items.length} items.`, 'WORKER'));

        const invoice = PARASUT_API_MOCK.createInvoice(vesselName, items);
        // Update ledger with new invoice amount
        const currentBalanceData = PARASUT_API_MOCK.getBalance(vesselName);
        const newPaymentStatus: PaymentHistoryStatus = currentBalanceData.paymentHistoryStatus ?? 'REGULAR';
        PARASUT_API_MOCK.updateBalance(vesselName, currentBalanceData.balance + invoice.amount, newPaymentStatus);

        actions.push({
            id: `fin_inv_${Date.now()}`,
            kind: 'external',
            name: 'ada.finance.invoiceCreated',
            params: { invoice }
        });

        // Chain reaction: Create Payment Link via Iyzico
        if (invoice.id) {
             addTrace(createLog('ada.finance', 'TOOL_EXECUTION', `Connecting to IYZICO/TRPay API... Generating payment link for Invoice ${invoice.id}.`, 'WORKER'));
            
            const link = IYZICO_API_MOCK.createPaymentLink(invoice.id, invoice.amount, vesselName);
            
            actions.push({
                id: `fin_pay_${Date.now()}`,
                kind: 'external',
                name: 'ada.finance.paymentLinkGenerated',
                params: { link }
            });
        }
    }

    return actions;
  },

};
