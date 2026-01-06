
// services/agents/registry.ts

import { TaskHandlerFn } from '../decomposition/types';

// Import All Expert Modules
import { travelHandlers, kitesExpert } from './travelAgent';
import { genericHandlers } from './genericAgent';
import { marinaHandlers, marinaExpert } from './marinaAgent';
import { weatherHandlers, weatherExpert } from './weatherAgent'; // Updated
import { technicHandlers, technicExpert } from './technicAgent';
import { passkitExpert } from './passkitAgent';
import { securityHandlers, securityExpert } from './securityAgent';
import { hrHandlers, hrExpert } from './hrAgent';
import { commercialHandlers, commercialExpert } from './commercialAgent';
import { analyticsHandlers, analyticsExpert } from './analyticsAgent';
import { facilityHandlers, facilityExpert } from './facilityAgent';
import { berthHandlers, berthExpert } from './berthAgent';
import { reservationsHandlers, reservationsExpert } from './reservationsAgent';
import { federationHandlers, federationExpert } from './federationAgent';
import { systemHandlers, systemExpert } from './systemAgent';
import { executiveExpert } from './executiveExpert';
import { conciergeExpert } from './conciergeAgent';
import { yieldExpert } from './yieldAgent';
import { itExpert } from './itAgent';
import { roboticsExpert } from './roboticsAgent';
import { shieldExpert } from './shieldAgent';
import { vhfExpert } from './vhfAgent';
import { scienceExpert } from './scienceAgent';
import { seaExpert } from './seaAgent'; // Added

// --- UNIFIED AGENT REGISTRY (THE 24 NODES) ---
// This acts as the "Service Locator" for the entire application.

export const AGENT_REGISTRY = {
    // 1. OPERATION DOMAIN
    'ada.marina': marinaExpert,
    'ada.sea': seaExpert,
    'ada.technic': technicExpert,
    'ada.facility': facilityExpert,
    'ada.berth': berthExpert,
    'ada.robotics': roboticsExpert,
    'ada.weather': weatherExpert,

    // 2. FINANCE DOMAIN
    'ada.finance': { ...commercialExpert, ...yieldExpert }, // Composite Leader
    'ada.commercial': commercialExpert,
    'ada.yield': yieldExpert,
    'ada.reservations': reservationsExpert,

    // 3. LEGAL DOMAIN
    'ada.legal': { ...securityExpert, ...passkitExpert }, // Composite Leader
    'ada.security': securityExpert,
    'ada.shield': shieldExpert,
    'ada.passkit': passkitExpert,
    'ada.hr': hrExpert,

    // 4. SERVICES DOMAIN
    'ada.concierge': conciergeExpert,
    'ada.congress': { /* Congress logic handled via Orchestrator state usually, but can be here */ },
    'ada.travel': kitesExpert,

    // 5. STARGATE DOMAIN (BRAIN)
    'ada.stargate': systemExpert, // System Ops
    'ada.system': systemExpert,
    'ada.federation': federationExpert,
    'ada.it': itExpert,
    'ada.analytics': { ...analyticsExpert, ...scienceExpert }, // Composite
    'ada.science': scienceExpert,
    'ada.vhf': vhfExpert,
    'ada.executive': executiveExpert
};

// --- HANDLERS FOR MDAP (Task Execution) ---
const passkitIssueHandler: TaskHandlerFn = async (ctx, obs) => {
    const { vesselName, ownerName, type } = obs.payload;
    const result = await passkitExpert.issuePass(vesselName, ownerName || 'Unknown', type || 'GUEST', () => {});
    return [{
        id: `act_pk_${Date.now()}`,
        kind: 'external',
        name: 'passkit.issued',
        params: result
    }];
};

const handlers: Record<string, TaskHandlerFn> = {
  ...travelHandlers,
  ...genericHandlers,
  ...marinaHandlers,
  ...weatherHandlers,
  ...technicHandlers,
  ...securityHandlers,
  ...hrHandlers,
  ...commercialHandlers,
  ...analyticsHandlers,
  ...facilityHandlers,
  ...berthHandlers,
  ...reservationsHandlers,
  ...federationHandlers,
  ...systemHandlers,
  'passkit.issue': passkitIssueHandler, 
};

export function getTaskHandler(name: string): TaskHandlerFn {
  const h = handlers[name];
  if (!h) {
      console.warn(`[Registry] Unknown task handler requested: '${name}'. Using dummy fallback.`);
      return async () => {
        return [{ id: `dummy_${Date.now()}`, kind: 'internal', name: 'unknown.handler.executed', params: { handlerName: name } }];
      };
  }
  return h;
}
