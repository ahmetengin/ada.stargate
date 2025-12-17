
import { AgentAction, AgentTraceLog, NodeName } from '../../types';
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

// DEPRECATED MOCK DATA: All data is now conceptually fetched from the Live SignalK MCP Server.
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

  // Skill: Get Real-Time Telemetry (Simulating SignalK MCP & PostgSail)
  getSignalKData: async (query: string, addTrace: (t: AgentTraceLog) => void): Promise<{ message: string, data: any }> => {
      addTrace(createLog('ada.sea', 'THINKING', `Connecting to SignalK MCP Server for live telemetry: "${query}"...`, 'EXPERT'));
      
      // Simulate network delay for MCP
      await new Promise(resolve => setTimeout(resolve, 600));

      const lowerQuery = query.toLowerCase();
      
      // PostgSail: Logbook & Trips
      if (lowerQuery.includes('logbook') || lowerQuery.includes('trip') || lowerQuery.includes('seyir') || lowerQuery.includes('history') || lowerQuery.includes('geçmiş')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: postgsail.get_recent_trips()`, 'WORKER'));
          
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
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('performance')`, 'WORKER'));
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

      // NMEA PGN Lookup (Engineering Mode)
      if (lowerQuery.includes('pgn') || lowerQuery.includes('code') || lowerQuery.includes('protocol')) {
          const pgnMatch = query.match(/\d{5,6}/);
          if (pgnMatch) {
              const protocolAnalysis = await seaExpert.analyzeRawProtocol(pgnMatch[0], addTrace);
              return {
                  message: `**NMEA 2000 DIAGNOSTICS (@canboat/canboatjs)**\n\n` +
                           `> **PGN:** ${protocolAnalysis.pgn}\n` +
                           `> **Definition:** ${protocolAnalysis.description}\n` +
                           `> **Data Fields:** ${protocolAnalysis.fields.join(', ') || 'N/A'}\n\n` +
                           `*Status: Raw stream available for debugging.*`,
                  data: protocolAnalysis
              };
          }
      }

      // Windy Visual Map
      if (lowerQuery.includes('windy') || lowerQuery.includes('map') || lowerQuery.includes('harita') || lowerQuery.includes('görsel')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_plugin_url('signalk-windy-plugin')`, 'WORKER'));
          const windyUrl = "http://localhost:3001/signalk-windy-plugin/";
          return {
              message: `**VISUAL WEATHER MAP (WINDY)**\n\nI have generated a live weather overlay for the current sector.\n\n[Open Windy Map](${windyUrl})\n\n*Source: signalk-windy-plugin*`,
              data: { url: windyUrl }
          };
      }

      // Wind & Environmental
      if (lowerQuery.includes('wind') || lowerQuery.includes('rüzgar')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('environment.wind.speedApparent')`, 'WORKER'));
          return {
              message: `**LIVE WIND DATA**\n\nSpeed: **14.5 knots**\nDirection: **NW (35° Apparent)**\n\n*Source: Masthead Sensor (NMEA 2000)*`,
              data: { value: 14.5, unit: 'knots' }
          };
      } 
      
      // Depth
      if (lowerQuery.includes('depth') || lowerQuery.includes('derinlik')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('environment.depth.belowTransducer')`, 'WORKER'));
          return {
              message: `**DEPTH SOUNDER**\n\nDepth: **4.2 meters**\nKeel Offset: 0.5m\n\n*Status: Safe for maneuvering.*`,
              data: { value: 4.2, unit: 'meters' }
          };
      }

      // Speed / Nav
      if (lowerQuery.includes('speed') || lowerQuery.includes('hız') || lowerQuery.includes('sog')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('navigation.speedOverGround')`, 'WORKER'));
          return {
              message: `**NAVIGATION STATUS**\n\nSOG: **7.2 knots**\nCOG: **185°**\n\n*AIS Status: Underway using engine.*`,
              data: { value: 7.2, unit: 'knots' }
          };
      }

      // Route / ETA (Course Provider)
      if (lowerQuery.includes('eta') || lowerQuery.includes('route') || lowerQuery.includes('waypoint') || lowerQuery.includes('kalan')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('navigation.courseRhumbline')`, 'WORKER'));
          return {
              message: `**NAVIGATION COMPUTER**\n\n` +
                       `> **Next Waypoint:** 12.4 nm (Bearing 185°)\n` +
                       `> **ETA:** 14:30 UTC\n` +
                       `> **XTE:** 0.02 nm (On Track)\n\n` +
                       `*Data Source: @signalk/course-provider*`,
              data: { eta: '14:30', dist: 12.4, bearing: 185, xte: 0.02 }
          };
      }

      // Meteorology (OpenWeather & WeatherFlow)
      if (lowerQuery.includes('pressure') || lowerQuery.includes('basınç') || lowerQuery.includes('weather') || lowerQuery.includes('hava') || lowerQuery.includes('temp') || lowerQuery.includes('rain') || lowerQuery.includes('yağmur') || lowerQuery.includes('uv') || lowerQuery.includes('lightning')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('environment.outside')`, 'WORKER'));
          return {
              message: `**METEOROLOGICAL STATION**\n\n` +
                       `> **Temperature:** 24.5 °C\n` +
                       `> **Pressure:** 1012 hPa (Steady)\n` +
                       `> **Humidity:** 65%\n` +
                       `> **UV Index:** 6\n` +
                       `> **Rain:** None` + 
                       `\n\n*Data Source: openweather-signalk & WeatherFlow Tempest*`,
              data: { temp: 24.5, press: 1012, hum: 65, uv: 6, rain: 0 }
          };
      }

      return {
          message: "Data point not found in SignalK stream.",
          data: null
      };
  }
};
