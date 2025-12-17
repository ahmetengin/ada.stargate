
import { AgentAction, AgentTraceLog, NodeName, SecurityThreat } from '../../types';

// Helper to create a log
const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const securityExpert = {
    
    // Skill: Review CCTV Footage (Unified Vision & Reasoning)
    // This skill simulates the "Eye" of the agent checking the specific camera feed.
    reviewCCTV: async (location: string, timeWindow: string, addTrace: (t: AgentTraceLog) => void): Promise<{ confirmed: boolean, evidenceId: string, details: string, detectedObjects: string[] }> => {
        addTrace(createLog('ada.security', 'THINKING', `Connecting to Camera Grid (NVR-Cluster-01)... Selecting feed: ${location}.`, 'EXPERT'));
        
        // Simulation delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        let detectionResult = "No anomalies detected.";
        let confirmed = false;
        let objects = ["Sea Surface", "Pontoon Structure"];

        // SCENARIO: Match the LiveMap "BREACH" at Pontoon A-S3
        if (location.includes('A-S3') || location.includes('Pontoon A') || location.includes('A-05')) {
            addTrace(createLog('ada.security', 'TOOL_EXECUTION', `Running YOLOv10 Object Detection on frame #4492...`, 'WORKER'));
            
            detectionResult = "CRITICAL: Unauthorized vessel contact detected. High-speed approach trajectory verified.";
            objects = ["Unidentified Speedboat (Type: Zodiac)", "Wake Turbulence", "Hull Contact"];
            confirmed = true;

            addTrace(createLog('ada.security', 'CODE_OUTPUT', `VISION ALERT: Class 'Speedboat' | Confidence: 98.4% | Vector: Stationary @ A-S3`, 'WORKER'));
        } else {
            addTrace(createLog('ada.security', 'OUTPUT', `Feed Analysis: Nominal. Routine activity only.`, 'WORKER'));
        }

        return {
            confirmed: confirmed,
            evidenceId: `EVD-${Date.now()}-${location.replace(/\s/g, '')}`,
            details: detectionResult,
            detectedObjects: objects
        };
    },

    // NEW Skill: Active Shield Scan (Sonar & Anti-Drone)
    // Connects to "ada.shield" node
    scanPerimeterShield: async (addTrace: (t: AgentTraceLog) => void): Promise<{ threats: SecurityThreat[], status: string }> => {
        addTrace(createLog('ada.shield', 'THINKING', `Activating Multi-Domain Perimeter Scan (Sonar + RF Spectrum)...`, 'EXPERT'));
        
        // Mock Threat Data (Simulating Antibes High-Security Environment)
        // 1 in 5 chance of a detection
        const threats: SecurityThreat[] = [];
        
        if (Math.random() > 0.8) {
            threats.push({
                id: `TRT-${Date.now()}`,
                type: 'DRONE',
                coordinates: { lat: 40.963, lng: 28.629 },
                altitudeDepth: 45, // meters alt
                speed: 12,
                riskLevel: 'HIGH',
                detectedBy: 'RF_SCANNER',
                timestamp: new Date().toISOString()
            });
            addTrace(createLog('ada.shield', 'WARNING', `AERIAL BREACH: Drone detected at 45m. RF Signature mismatch.`, 'WORKER'));
        }

        if (Math.random() > 0.9) {
             threats.push({
                id: `TRT-SUB-${Date.now()}`,
                type: 'DIVER',
                coordinates: { lat: 40.962, lng: 28.630 },
                altitudeDepth: -4, // meters depth
                speed: 1,
                riskLevel: 'CRITICAL',
                detectedBy: 'SONAR',
                timestamp: new Date().toISOString()
            });
            addTrace(createLog('ada.shield', 'CRITICAL', `SUBSEA CONTACT: Diver signature in Sector Bravo.`, 'WORKER'));
        }

        if (threats.length === 0) {
            addTrace(createLog('ada.shield', 'OUTPUT', `Perimeter Secure. No aerial or subsea contacts.`, 'WORKER'));
        }

        return { threats, status: threats.length > 0 ? 'ALERT' : 'SECURE' };
    },

    // Skill: Dispatch Security Unit
    dispatchGuard: async (location: string, priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY', addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.security', 'THINKING', `Calculating nearest patrol unit to ${location}...`, 'EXPERT'));
        
        // Logic: If Priority is EMERGENCY, deploy multiple assets
        const assets = priority === 'EMERGENCY' ? ['Patrol-Alpha (Land)', 'WIM-Bravo (Sea)'] : ['Patrol-Alpha (Land)'];

        addTrace(createLog('ada.security', 'TOOL_EXECUTION', `Dispatching units: ${assets.join(', ')}. Protocol: ${priority}`, 'WORKER'));
        
        return [{
            id: `sec_dispatch_${Date.now()}`,
            kind: 'external',
            name: 'ada.security.dispatch',
            params: { units: assets, location, priority, timestamp: new Date().toISOString() }
        }];
    },

    // Skill: Flag Vessel (Security Hold)
    flagVessel: async (vesselName: string, reason: string, addTrace: (t: AgentTraceLog) => void): Promise<AgentAction[]> => {
        addTrace(createLog('ada.security', 'THINKING', `Initiating Administrative Block Protocol for ${vesselName}. Reason: ${reason}`, 'EXPERT'));
        
        return [{
            id: `sec_flag_${Date.now()}`,
            kind: 'internal',
            name: 'ada.security.flagVessel',
            params: { vesselName, status: 'RED', restriction: 'DEPARTURE_BAN' }
        }];
    },

    // Skill: Process Access Pass (Gate Entry/Exit)
    processAccessPass: async (userName: string, gateId: string, direction: 'ENTRY' | 'EXIT', addTrace: (t: AgentTraceLog) => void): Promise<void> => {
        // This is primarily for logging simulation
        const message = `[ACCESS CONTROL] ${direction.toUpperCase()}: ${userName} via ${gateId}. Auth: QR/NFC.`;
        
        // We log it conceptually, in a real app we'd push to the Orchestrator Logs
        console.log(message);
        
        // Simulating the trace that would appear on the Ops Dashboard
        // (Since this function is often called from UI directly without full Orchestrator context in this mock, 
        // we assume the UI handles the state update, but we return a promise for consistency)
        return Promise.resolve();
    }
};

export const securityHandlers = {
    'security.reviewCCTV': async (ctx: any, obs: any) => {
        // Wrapper for decomposition layer if needed
        return [];
    }
};