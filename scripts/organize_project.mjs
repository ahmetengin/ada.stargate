
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const archiveDir = path.join(rootDir, '_ARCHIVE_LEGACY');

console.log('🧹 ADA STARGATE: PROJECT CLEANUP & ORGANIZATION PROTOCOL');
console.log('-------------------------------------------------------');

// 1. Create Archive Directory
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
    console.log(`📂 Created Archive Directory: ${archiveDir}`);
}

// 2. Define Items to Archive (Relative Paths)
const itemsToArchive = [
    // Old Backend Attempts
    'apps',
    'backend-go',
    'Old_source',
    
    // AI Generation Artifacts & Temporary Docs
    'ahmetengin.md',
    'BACKEND_SOURCE_CODE.md',
    'HYPERSCALE_IMPLEMENTATION.md',
    'MAKER_IMPLEMENTATION.md',
    'FAST_RTC_IMPLEMENTATION.md',
    'TODO_HYPERSCALE_ACTIVATION.md',
    'PROJECT_STATUS_SNAPSHOT.md',
    'EnvSample.md',
    'offline_setup.sh.md',
    'backend/nano.py.md',
    'backend/vhf_radio.py.md',
    'backend/main.py.md',
    'backend/architecture_graph.py.md',
    'backend/ingest.py.md',
    'backend/config.py.md',
    'backend/schemas.py.md',
    'backend/Dockerfile.md',
    'backend/router_edge.py.md',
    
    // Deprecated Frontend Files
    'components/CaptainDesk.tsx', // Replaced by Canvas
    'services/agents/maintenanceAgent.ts', // Replaced by technicAgent
    'services/agents/presenterAgent.ts', // Deprecated
    'services/agents/presenterExpert.ts', // Deprecated
];

// 3. Execution Function
const moveItem = (relativePath) => {
    const sourcePath = path.join(rootDir, relativePath);
    const destPath = path.join(archiveDir, path.basename(relativePath));

    if (fs.existsSync(sourcePath)) {
        try {
            // Handle naming collisions in archive by appending timestamp if needed
            if (fs.existsSync(destPath)) {
                const timestamp = Date.now();
                const ext = path.extname(destPath);
                const name = path.basename(destPath, ext);
                const newDestName = `${name}_${timestamp}${ext}`;
                fs.renameSync(sourcePath, path.join(archiveDir, newDestName));
                console.log(`📦 Archived (Renamed): ${relativePath} -> _ARCHIVE_LEGACY/${newDestName}`);
            } else {
                fs.renameSync(sourcePath, destPath);
                console.log(`📦 Archived: ${relativePath}`);
            }
        } catch (err) {
            console.error(`⚠️  Failed to move ${relativePath}: ${err.message}`);
        }
    }
};

// 4. Run
itemsToArchive.forEach(item => moveItem(item));

console.log('-------------------------------------------------------');
console.log('✨ CLEANUP COMPLETE.');
console.log('👉 Your active workspace is now optimized for the "Hyperscale" architecture.');
console.log('👉 Old files are safe in the "_ARCHIVE_LEGACY" folder.');
