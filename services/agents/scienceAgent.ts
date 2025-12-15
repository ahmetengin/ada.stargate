
// services/agents/scienceAgent.ts

import { AgentAction, AgentTraceLog, NodeName, VesselIntelligenceProfile } from '../../types';
import { dmarinMasterData } from '../dmarinMasterData';

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_science_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node: 'ada.analytics', // Reusing analytics node for now
    step,
    content,
    persona
});

export const scienceExpert = {
    
    // Skill: Collect Passive Telemetry (Ocean Mapping)
    collectTelemetry: async (vesselName: string, location: {lat: number, lng: number}, data: any, addTrace: (t: AgentTraceLog) => void): Promise<void> => {
        // In reality, this runs 24/7. Here we simulate a "ping".
        addTrace(createLog('ada.analytics', 'THINKING', `[PROJECT POSEIDON] Receiving NMEA 2000 Packet from ${vesselName}...`, 'WORKER'));
        
        // Simulate data processing
        const waterTemp = (22 + Math.random() * 2).toFixed(1);
        const depth = (45 + Math.random() * 10).toFixed(1);
        
        addTrace(createLog('ada.analytics', 'CODE_OUTPUT', `DATA POINT: Lat ${location.lat.toFixed(4)} / Lng ${location.lng.toFixed(4)} | SeaTemp: ${waterTemp}°C | Depth: ${depth}m | Source: ${vesselName}`, 'WORKER'));
        
        // Logic: Check for anomalies
        if (parseFloat(waterTemp) > 25) {
             addTrace(createLog('ada.analytics', 'WARNING', `ANOMALY: High Sea Surface Temperature detected. Flagging for climate analysis.`, 'EXPERT'));
        }
    },

    // Skill: Assign Exploration Mission
    assignMission: async (vesselName: string, currentLocation: string, addTrace: (t: AgentTraceLog) => void): Promise<string> => {
        const missions = dmarinMasterData.ocean_guardians?.active_missions || [];
        const randomMission = missions[Math.floor(Math.random() * missions.length)];
        
        addTrace(createLog('ada.analytics', 'PLANNING', `Scanning vicinity of ${currentLocation} for scientific interest points...`, 'EXPERT'));
        
        return `**🌊 OCEAN GUARDIAN MISSION ALERT**\n\n` +
               `Captain, welcome to the **${currentLocation}** sector.\n\n` +
               `**Target:** ${randomMission.name} (${randomMission.target})\n` +
               `**Brief:** We have a data gap in this quadrant. Please enable your sensors or keep a lookout.\n` +
               `**Reward:** ${randomMission.reward}\n\n` +
               `*“The sea connects all things.”*`;
    }
};
