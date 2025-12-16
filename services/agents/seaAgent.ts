
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

// Mock SignalK Data Paths
const SIGNALK_PATHS: Record<string, any> = {
    'environment.wind.speedApparent': { value: 12.5, unit: 'knots' },
    'environment.wind.angleApparent': { value: 310, unit: 'deg' },
    'environment.depth.belowTransducer': { value: 4.2, unit: 'meters' },
    'navigation.speedOverGround': { value: 7.8, unit: 'knots' },
    'navigation.courseOverGroundTrue': { value: 185, unit: 'deg' }
};

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

  // Skill: Get Real-Time Telemetry (Simulating SignalK MCP)
  getSignalKData: async (query: string, addTrace: (t: AgentTraceLog) => void): Promise<{ message: string, data: any }> => {
      addTrace(createLog('ada.sea', 'THINKING', `Connecting to SignalK MCP Server for live telemetry: "${query}"...`, 'EXPERT'));
      
      // Simulate network delay for MCP
      await new Promise(resolve => setTimeout(resolve, 600));

      let path = '';
      let result = null;

      if (query.includes('wind') || query.includes('rüzgar')) {
          path = 'environment.wind.speedApparent';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**LIVE WIND DATA**\n\nSpeed: **${result.value} ${result.unit}**\nDirection: **NW (310°)**\n\n*Source: Masthead Sensor (NMEA 2000)*`,
              data: result
          };
      } 
      
      if (query.includes('depth') || query.includes('derinlik')) {
          path = 'environment.depth.belowTransducer';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**DEPTH SOUNDER**\n\nDepth: **${result.value} ${result.unit}**\nKeel Offset: 0.5m\n\n*Status: Safe for maneuvering.*`,
              data: result
          };
      }

      if (query.includes('speed') || query.includes('hız') || query.includes('sog')) {
          path = 'navigation.speedOverGround';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**NAVIGATION STATUS**\n\nSOG: **${result.value} ${result.unit}**\nCOG: **185°**\n\n*AIS Status: Underway using engine.*`,
              data: result
          };
      }

      return {
          message: "SignalK data not available for this parameter.",
          data: null
      };
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
