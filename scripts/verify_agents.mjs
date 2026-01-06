
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🕵️  ADA STARGATE: AGENT VERIFICATION PROTOCOL');
console.log('-------------------------------------------');

const requiredAgents = [
    'services/agents/marinaAgent.ts',
    'services/agents/financeAgent.ts',
    'services/agents/legalAgent.ts',
    'services/agents/technicAgent.ts',
    'services/agents/securityAgent.ts',
    'services/agents/conciergeAgent.ts',
    'services/agents/hrAgent.ts',
    'services/agents/executiveExpert.ts',
    'services/agents/itAgent.ts',
    'services/agents/roboticsAgent.ts',
    'services/agents/shieldAgent.ts',
    'services/agents/yieldAgent.ts',
    'services/agents/travelAgent.ts',
    'services/agents/registry.ts'
];

let missingCount = 0;

requiredAgents.forEach(agentPath => {
    const fullPath = path.join(rootDir, agentPath);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ FOUND: ${agentPath}`);
    } else {
        console.log(`❌ MISSING: ${agentPath}`);
        missingCount++;
    }
});

console.log('-------------------------------------------');
if (missingCount === 0) {
    console.log('✨ ALL SYSTEMS NOMINAL. AGENT ROSTER COMPLETE.');
} else {
    console.log(`⚠️  ${missingCount} AGENTS MISSING. SYSTEM MAY BE UNSTABLE.`);
}
