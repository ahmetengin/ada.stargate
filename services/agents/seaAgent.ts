
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

// Mock SignalK Data Paths
// UPDATED: Now includes derived data from @signalk/course-provider AND openweather-signalk AND signalk-weatherflow AND signalk-racer
const SIGNALK_PATHS: Record<string, any> = {
    // Local Sensors (NMEA)
    'environment.wind.speedApparent': { value: 14.5, unit: 'knots' },
    'environment.wind.angleApparent': { value: 35, unit: 'deg' }, // Close hauled
    'environment.wind.speedTrue': { value: 12.0, unit: 'knots' },
    'environment.wind.angleTrueWater': { value: 48, unit: 'deg' },
    'environment.depth.belowTransducer': { value: 4.2, unit: 'meters' },
    'navigation.speedOverGround': { value: 7.2, unit: 'knots' },
    'navigation.courseOverGroundTrue': { value: 185, unit: 'deg' },
    'navigation.speedThroughWater': { value: 7.4, unit: 'knots' },
    
    // Course Provider Data (Navigation Computer)
    'navigation.courseRhumbline.nextPoint.eta': { value: '14:30 UTC', unit: 'timestamp' },
    'navigation.courseRhumbline.nextPoint.distance': { value: 12.4, unit: 'nm' },
    'navigation.courseRhumbline.crossTrackError': { value: 0.02, unit: 'nm' },
    'navigation.courseRhumbline.nextPoint.bearingTrue': { value: 185, unit: 'deg' },

    // OpenWeather Data (Forecast/Regional)
    'environment.outside.temperature': { value: 24.5, unit: 'C' },
    'environment.outside.pressure': { value: 1012, unit: 'hPa' },
    'environment.outside.humidity': { value: 65, unit: '%' },

    // WeatherFlow Tempest (Hyper-Local)
    'environment.outside.illuminance': { value: 85000, unit: 'lux' },
    'environment.outside.uvIndex': { value: 6, unit: 'index' },
    'environment.outside.rainRate': { value: 0.0, unit: 'mm/h' },
    'environment.outside.lightning.distance': { value: 0, unit: 'km' }, 
    'environment.outside.lightning.strikes': { value: 0, unit: 'count' },

    // SignalK Racer (Tactical Data)
    'performance.velocityMadeGood': { value: 5.1, unit: 'knots' },
    'performance.polarSpeed': { value: 7.8, unit: 'knots' }, // Theoretical max at this wind
    'performance.polarSpeedRatio': { value: 0.92, unit: 'ratio' }, // 92% efficiency
    'performance.targetAngle': { value: 45, unit: 'deg' }, // Optimal TWA
    'performance.tackMagnetic': { value: 275, unit: 'deg' } // Heading after tack
};

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
      let path = '';
      let result = null;

      // PostgSail: Logbook & Trips
      if (lowerQuery.includes('logbook') || lowerQuery.includes('trip') || lowerQuery.includes('seyir') || lowerQuery.includes('history') || lowerQuery.includes('geçmiş')) {
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: postgsail.get_recent_trips()`, 'WORKER'));
          const trip = POSTGSAIL_TRIPS[0];
          
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
          const vmg = SIGNALK_PATHS['performance.velocityMadeGood'];
          const polarSpeed = SIGNALK_PATHS['performance.polarSpeed'];
          const efficiency = SIGNALK_PATHS['performance.polarSpeedRatio'];
          const targetAngle = SIGNALK_PATHS['performance.targetAngle'];
          const nextTack = SIGNALK_PATHS['performance.tackMagnetic'];
          const windTrue = SIGNALK_PATHS['environment.wind.angleTrueWater'];

          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('performance')`, 'WORKER'));

          return {
              message: `**TACTICAL SAILING ANALYSIS**\n\n` +
                       `> **Efficiency:** ${(efficiency.value * 100).toFixed(0)}% of Polar\n` +
                       `> **VMG:** ${vmg.value} kn\n` +
                       `> **Target Angle:** ${targetAngle.value}° (Current: ${windTrue.value}°)\n` +
                       `> **Next Tack Heading:** ${nextTack.value}°\n\n` +
                       `*Suggestion: Harden up 3 degrees to optimize VMG.*`,
              data: { vmg, polarSpeed, efficiency, targetAngle, nextTack }
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
          path = 'environment.wind.speedApparent';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**LIVE WIND DATA**\n\nSpeed: **${result.value} ${result.unit}**\nDirection: **NW (35° Apparent)**\n\n*Source: Masthead Sensor (NMEA 2000)*`,
              data: result
          };
      } 
      
      // Depth
      if (lowerQuery.includes('depth') || lowerQuery.includes('derinlik')) {
          path = 'environment.depth.belowTransducer';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**DEPTH SOUNDER**\n\nDepth: **${result.value} ${result.unit}**\nKeel Offset: 0.5m\n\n*Status: Safe for maneuvering.*`,
              data: result
          };
      }

      // Speed / Nav
      if (lowerQuery.includes('speed') || lowerQuery.includes('hız') || lowerQuery.includes('sog')) {
          path = 'navigation.speedOverGround';
          result = SIGNALK_PATHS[path];
          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('${path}')`, 'WORKER'));
          return {
              message: `**NAVIGATION STATUS**\n\nSOG: **${result.value} ${result.unit}**\nCOG: **185°**\n\n*AIS Status: Underway using engine.*`,
              data: result
          };
      }

      // Route / ETA (Course Provider)
      if (lowerQuery.includes('eta') || lowerQuery.includes('route') || lowerQuery.includes('waypoint') || lowerQuery.includes('kalan')) {
          const eta = SIGNALK_PATHS['navigation.courseRhumbline.nextPoint.eta'];
          const dist = SIGNALK_PATHS['navigation.courseRhumbline.nextPoint.distance'];
          const bearing = SIGNALK_PATHS['navigation.courseRhumbline.nextPoint.bearingTrue'];
          const xte = SIGNALK_PATHS['navigation.courseRhumbline.crossTrackError'];

          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('navigation.courseRhumbline')`, 'WORKER'));
          
          return {
              message: `**NAVIGATION COMPUTER**\n\n` +
                       `> **Next Waypoint:** ${dist.value} nm (Bearing ${bearing.value}°)\n` +
                       `> **ETA:** ${eta.value}\n` +
                       `> **XTE:** ${xte.value} nm (On Track)\n\n` +
                       `*Data Source: @signalk/course-provider*`,
              data: { eta, dist, bearing, xte }
          };
      }

      // Meteorology (OpenWeather & WeatherFlow)
      if (lowerQuery.includes('pressure') || lowerQuery.includes('basınç') || lowerQuery.includes('weather') || lowerQuery.includes('hava') || lowerQuery.includes('temp') || lowerQuery.includes('rain') || lowerQuery.includes('yağmur') || lowerQuery.includes('uv') || lowerQuery.includes('lightning')) {
          const temp = SIGNALK_PATHS['environment.outside.temperature'];
          const press = SIGNALK_PATHS['environment.outside.pressure'];
          const hum = SIGNALK_PATHS['environment.outside.humidity'];
          
          // WeatherFlow Data
          const uv = SIGNALK_PATHS['environment.outside.uvIndex'];
          const rain = SIGNALK_PATHS['environment.outside.rainRate'];
          const lightning = SIGNALK_PATHS['environment.outside.lightning.distance'];

          addTrace(createLog('ada.sea', 'TOOL_EXECUTION', `MCP Call: get_vessel_data('environment.outside')`, 'WORKER'));

          let stormAlert = "";
          if (lightning && lightning.value > 0 && lightning.value < 15) {
              stormAlert = `\n\n⚠️ **STORM ALERT:** Lightning detected ${lightning.value}km away.`;
          }

          let rainStatus = rain.value > 0 ? `Raining (${rain.value} mm/h)` : "None";

          return {
              message: `**METEOROLOGICAL STATION**\n\n` +
                       `> **Temperature:** ${temp.value} °C\n` +
                       `> **Pressure:** ${press.value} hPa (Steady)\n` +
                       `> **Humidity:** ${hum.value}%\n` +
                       `> **UV Index:** ${uv.value}\n` +
                       `> **Rain:** ${rainStatus}` + 
                       stormAlert + 
                       `\n\n*Data Source: openweather-signalk & WeatherFlow Tempest*`,
              data: { temp, press, hum, uv, rain, lightning }
          };
      }

      return {
          message: "Data point not found in SignalK stream.",
          data: null
      };
  }
};
