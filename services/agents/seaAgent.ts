
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
import { getCurrentMaritimeTime } from '../utils';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_sea_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

export const seaExpert = {
  
  // Skill: Autonomous Navigation Analysis (COLREGs)
  evaluateSituation: async (ownShip: any, targetShip: any, visibility: 'GOOD' | 'RESTRICTED', addTrace: (t: AgentTraceLog) => void): Promise<{ action: string, rule: string, status: string }> => {
    addTrace(createLog('ada.sea', 'THINKING', `Processing Radar Contact: ${targetShip.name} | Bearing: ${targetShip.bearing}° | Range: ${targetShip.range}nm`, 'EXPERT'));

    // Normalize bearing relative to heading
    const relativeBearing = (targetShip.bearing - ownShip.heading + 360) % 360;
    let action = "MAINTAIN COURSE AND SPEED";
    let rule = "Rule 19 (Conduct of Vessels)";
    let status = "SAFE";

    // COLREGs Logic Tree
    if (visibility === 'RESTRICTED') {
        addTrace(createLog('ada.sea', 'WARNING', `Visibility Restricted. Applying Rule 19. Radar Plotting active.`, 'WORKER'));
        if (targetShip.range < 2.0) {
            action = "REDUCE SPEED. SOUND FOG SIGNAL.";
            status = "CAUTION";
        }
    } else {
        // Crossing Situation (Rule 15)
        if (relativeBearing > 0 && relativeBearing < 112.5) {
            // Target is on Starboard -> We Give Way
            action = "ALTER COURSE TO STARBOARD. PASS ASTERN.";
            rule = "Rule 15 (Crossing Situation)";
            status = "GIVE_WAY";
            addTrace(createLog('ada.sea', 'PLANNING', `Collision Risk Detected (Starboard). I am the Give-Way vessel.`, 'WORKER'));
        } else if (relativeBearing > 247.5) {
            // Target is on Port -> We Stand On
            action = "STAND ON. MONITOR CPA.";
            rule = "Rule 17 (Action by Stand-on Vessel)";
            status = "STAND_ON";
        }
    }

    addTrace(createLog('ada.sea', 'OUTPUT', `Decision: ${action} [${rule}]`, 'EXPERT'));

    return { action, rule, status };
  },

  // Skill: Telemetry Logging
  logTelemetry: async (data: any, addTrace: (t: AgentTraceLog) => void): Promise<AgentAction> => {
      // In reality, this pushes to TimescaleDB
      // Here we just log for the trace
      // addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `NMEA Packet: ${JSON.stringify(data)}`, 'WORKER'));
      return {
          id: `sea_log_${Date.now()}`,
          kind: 'internal',
          name: 'sea.telemetryLogged',
          params: data
      };
  }
};
