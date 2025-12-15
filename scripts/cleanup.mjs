
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔥 ADA STARGATE PROTOCOL: DEEP CLEAN INITIALIZED');
console.log('-----------------------------------------------');

// 1. DELETE LIST (Klasörler ve Dosyalar)
const pathsToDelete = [
    'apps',                          // Eski Go Backend ve CLI denemeleri
    'Old_source',                    // Önceki yedekler (Artık gereksiz)
    'backend/nano.py.md',            // Markdown kod taslakları
    'backend/vhf_radio.py.md',
    'backend/main.py.md',
    'backend/architecture_graph.py.md',
    'backend/ingest.py.md',
    'backend/config.py.md',
    'backend/schemas.py.md',
    'backend/Dockerfile.md',
    'backend/router_edge.py.md',
    'backend/events.py.md',
    'backend/listener.py.md',
    'backend/skills',                // Eski skill yapısı (Artık MCP/Tools var)
    'docker-compose.hyperscale.yml.md',
    'nginx/nginx.conf.md',
    'offline_setup.sh.md',
    'EnvSample.md',
    'FAST_RTC_IMPLEMENTATION.md',
    'HYPERSCALE_IMPLEMENTATION.md',
    'MAKER_IMPLEMENTATION.md',
    'TODO_HYPERSCALE_ACTIVATION.md',
    'PROJECT_STATUS_SNAPSHOT.md',
    'ahmetengin.md',
    'services/agents/maintenanceAgent.ts', // Deprecated
    'services/agents/presenterAgent.ts',   // Deprecated
    'services/agents/presenterExpert.ts',  // Deprecated
    'components/CaptainDesk.tsx'           // Deprecated
];

// 2. DELETION LOGIC
const deletePath = (relativePath) => {
    const fullPath = path.join(rootDir, relativePath);
    if (fs.existsSync(fullPath)) {
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`🗑️  Deleted Directory: ${relativePath}`);
            } else {
                fs.unlinkSync(fullPath);
                console.log(`❌ Deleted File:      ${relativePath}`);
            }
        } catch (err) {
            console.error(`⚠️  Failed to delete ${relativePath}: ${err.message}`);
        }
    }
};

// EXECUTE DELETION
pathsToDelete.forEach(p => deletePath(p));

console.log('-----------------------------------------------');
console.log('✨ SYSTEM PURIFIED. READY FOR HYPERSCALE DEPLOYMENT.');
