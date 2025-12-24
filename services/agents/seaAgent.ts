
import { AgentAction, AgentTraceLog, NodeName, NavtexMessage } from '../../types';
import { getCurrentMaritimeTime } from '../utils';
// import { FromPgn } from '@canboat/canboatjs'; 
// import { PostgSail } from '@xbgmsharp/postgsail-mcp-server';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_sea_${Date.now()}_${Math.random()}`,
    timestamp: getCurrentMaritimeTime(),
    node,
    step,
    content,
    persona
});

// NMEA 2000 PGN Database (Simulated capability from CanboatJS)
const N2K_PGNS: Record<string, string> = {
    '127250': 'Vessel Heading',
    '127258': 'Magnetic Variation',
    '127488': 'Engine Parameters, Rapid Update',
    '127489': 'Engine Parameters, Dynamic',
    '127508': 'Battery Status',
    '128259': 'Speed: Water Referenced',
    '128267': 'Water Depth',
    '129025': 'Position, Rapid Update',
    '129026': 'COG & SOG, Rapid Update',
    '129029': 'GNSS Position Data',
    '130306': 'Wind Data'
};

// PostgSail Trip Database (Simulated capability)
const POSTGSAIL_TRIPS = [
    { id: 294, name: "Gocek to Bodrum", date: "2025-10-15", duration: "14h 20m", distance: "85 nm", avgSpeed: "7.4 kn", maxWind: "22 kn" },
    { id: 293, name: "Bay Tour (Fethiye)", date: "2025-10-12", duration: "4h 10m", distance: "22 nm", avgSpeed: "5.2 kn", maxWind: "15 kn" },
    { id: 292, name: "Marmaris Transfer", date: "2025-10-05", duration: "9h 45m", distance: "60 nm", avgSpeed: "6.8 kn", maxWind: "18 kn" }
];

// DEPRECATED MOCK DATA: All data is now conceptually fetched from the Live OneNet Data Stream.
const SIGNALK_PATHS: Record<string, any> = {};

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

  // Skill: Fetch and Parse NAVTEX Messages (SHOD / NAVAREA III)
  fetchActiveNavtex: async (region: 'MARMARA' | 'AEGEAN' | 'MED', addTrace: (t: AgentTraceLog) => void): Promise<{ messages: NavtexMessage[], summary: string }> => {
      addTrace(createLog('ada.sea', 'THINKING', `Scanning 518 kHz (International) & 490 kHz (National) for MSI... Region: ${region}`, 'EXPERT'));
      
      // Simulate Radio/Web Fetch Latency
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMessages: NavtexMessage[] = [];

      if (region === 'MARMARA' || region === 'AEGEAN') {
          // Message 1: Gunnery Exercise (Standard Turkish Navy warning)
          mockMessages.push({
              id: 'NAVTEX-382/25',
              stationCode: 'I', // Izmir
              messageType: 'A', // Navigational Warning
              content: `TURNHOS N/W : 0382/25
AEGEAN SEA
1. GUNNERY EXERCISE, ON 21 NOV 25 FROM 0500Z TO 0900Z IN AREA BOUNDED BY:
38 45.00 N - 025 21.00 E
38 45.00 N - 024 52.00 E
38 18.00 N - 024 52.00 E
38 18.00 N - 025 21.00 E
CAUTION ADVISED.`,
              coordinates: { lat: 38.75, lng: 25.35 },
              status: 'ACTIVE',
              timestamp: getCurrentMaritimeTime()
          });

          // Message 2: Conflicting Greek Message (The Ege Dispute Simulation)
          mockMessages.push({
              id: 'LA88-245/25',
              stationCode: 'L', // Limnos
              messageType: 'A',
              content: `ZCZC LA88
201000 UTC NOV 25
LIMNOS RADIO NAVWARN 245/25
AEGEAN SEA
UNAUTHORIZED STATION "IZMIR" BROADCAST NAVTEX MESSAGE NUMBER FA67-0382/25 IN GREEK NAVTEX SERVICE AREA.
THE SAID MESSAGE IS NULL AND VOID.
ONLY LIMNOS RADIO HAS AUTHORITY TO BROADCAST NAVTEX MESSAGES IN THIS AREA.
NNNN`,
              status: 'ACTIVE',
              timestamp: getCurrentMaritimeTime()
          });
      }

      addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Parsed 2 active messages from 518kHz stream.`, 'WORKER'));
      
      // Ada's Cognitive Summary of the Situation
      const summary = `**NAVTEX INTELLIGENCE REPORT**\n` +
                      `Active Warnings: **${mockMessages.length}**\n` +
                      `> **Critical:** Gunnery Exercise in Central Aegean (0500Z-0900Z).\n` +
                      `> **Notice:** Detected overlapping broadcast from Station Limnos (L) regarding Station Izmir (I). Protocol: Follow Safety Zone coordinates regardless of jurisdiction dispute.\n\n` +
                      `*Disclaimer: This data is for situational awareness only. Official navigation requires certified NAVTEX receiver.*`;

      addTrace(createLog('ada.sea', 'OUTPUT', `NAVTEX Briefing prepared. Conflicting mandates highlighted for Captain.`, 'EXPERT'));

      return { messages: mockMessages, summary };
  },

  // Skill: Analyze Raw NMEA 2000 Protocol (CanboatJS)
  analyzeRawProtocol: async (pgn: string, addTrace: (t: AgentTraceLog) => void): Promise<{ pgn: string, description: string, fields: string[] }> => {
      addTrace(createLog('ada.sea', 'THINKING', `Decoding raw NMEA 2000 stream using CanboatJS logic for PGN: ${pgn}...`, 'EXPERT'));
      
      const description = N2K_PGNS[pgn] || 'Unknown PGN / Proprietary';
      let fields: string[] = [];

      if (pgn === '127488') {
          fields = ['Engine Speed (RPM)', 'Boost Pressure', 'Tilt/Trim'];
      } else if (pgn === '127508') {
          fields = ['Voltage', 'Current', 'Temperature', 'SID'];
      } else if (pgn === '130306') {
          fields = ['Wind Speed', 'Wind Angle', 'Reference (True/Apparent)'];
      }

      addTrace(createLog('ada.sea', 'CODE_OUTPUT', `DECODED: ${description} [${fields.join(', ')}]`, 'WORKER'));

      return { pgn, description, fields };
  },

  // Skill: Get Real-Time Telemetry (Simulating OneNet Data Stream & PostgSail)
  getSignalKData: async (query: string, addTrace: (t: AgentTraceLog) => void): Promise<{ message: string, data: any }> => {
      addTrace(createLog('ada.sea', 'THINKING', `Connecting to OneNet Data Stream for live telemetry: "${query}"...`, 'EXPERT'));
      
      // Simulate network delay for IP-based data
      await new Promise(resolve => setTimeout(resolve, 150));

      const lowerQuery = query.toLowerCase();
      
      // PostgSail: Logbook & Trips
      if (lowerQuery.includes('logbook') || lowerQuery.includes('trip') || lowerQuery.includes('seyir') || lowerQuery.includes('history') || lowerQuery.includes('geçmiş')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: postgsail.get_recent_trips()`, 'WORKER'));
          
          return {
              message: `**DIGITAL LOGBOOK (PostgSail)**\n\n` +
                       `I retrieved your recent trip history from the cloud:\n\n` +
                       POSTGSAIL_TRIPS.map(t => `> **${t.date}:** ${t.name} (${t.distance})\n   *Dur: ${t.duration} | Avg: ${t.avgSpeed}*`).join('\n') +
                       `\n\n*All tracks are synced to your cloud profile.*`,
              data: POSTGSAIL_TRIPS
          };
      }

      // Sailing Tactics (SignalK Racer)
      if (lowerQuery.includes('sail') || lowerQuery.includes('yelken') || lowerQuery.includes('tack') || lowerQuery.includes('tramola') || lowerQuery.includes('polar') || lowerQuery.includes('vmg')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: performance.*`, 'WORKER'));
          return {
              message: `**TACTICAL SAILING ANALYSIS**\n\n` +
                       `> **Efficiency:** 92% of Polar\n` +
                       `> **VMG:** 5.1 kn\n` +
                       `> **Target Angle:** 45° (Current: 48°)\n` +
                       `> **Next Tack Heading:** 275°\n\n` +
                       `*Suggestion: Harden up 3 degrees to optimize VMG.*`,
              data: { vmg: 5.1, polarSpeed: 7.8, efficiency: 0.92, targetAngle: 45, nextTack: 275 }
          };
      }

      // Wind & Environmental
      if (lowerQuery.includes('wind') || lowerQuery.includes('rüzgar')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: environment.wind.speedApparent`, 'WORKER'));
          return {
              message: `**LIVE WIND DATA**\n\nSpeed: **14.5 knots**\nDirection: **NW (35° Apparent)**\n\n*Source: Vessel Main Bus (OneNet)*`,
              data: { value: 14.5, unit: 'knots' }
          };
      } 
      
      // Depth
      if (lowerQuery.includes('depth') || lowerQuery.includes('derinlik')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: environment.depth.belowTransducer`, 'WORKER'));
          return {
              message: `**DEPTH SOUNDER**\n\nDepth: **4.2 meters**\nKeel Offset: 0.5m\n\n*Status: Safe for maneuvering.*`,
              data: { value: 4.2, unit: 'meters' }
          };
      }

      // Speed / Nav
      if (lowerQuery.includes('speed') || lowerQuery.includes('hız') || lowerQuery.includes('sog')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: navigation.speedOverGround`, 'WORKER'));
          return {
              message: `**NAVIGATION STATUS**\n\nSOG: **7.2 knots**\nCOG: **185°**\n\n*AIS Status: Underway using engine.*`,
              data: { value: 7.2, unit: 'knots' }
          };
      }

      // Route / ETA (Course Provider)
      if (lowerQuery.includes('eta') || lowerQuery.includes('route') || lowerQuery.includes('waypoint') || lowerQuery.includes('kalan')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `Query: navigation.course`, 'WORKER'));
          return {
              message: `**NAVIGATION COMPUTER**\n\n` +
                       `> **Next Waypoint:** 12.4 nm (Bearing 185°)\n` +
                       `> **ETA:** 14:30 UTC\n` +
                       `> **XTE:** 0.02 nm (On Track)\n\n` +
                       `*Data Source: Onboard Route Planner (OneNet)*`,
              data: { eta: '14:30', dist: 12.4, bearing: 185, xte: 0.02 }
          };
      }
      
      return {
          message: "Data point not found in OneNet stream.",
          data: null
      };
  }
};
