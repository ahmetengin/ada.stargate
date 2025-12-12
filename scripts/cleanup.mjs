
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const archiveDir = path.join(rootDir, '.archive');

// List of files and folders to be archived
const filesToArchive = [
    // Logs and conversational history
    'ahmetengin.md',
    'PROJECT_STATUS_SNAPSHOT.md',
    'TODO_HYPERSCALE_ACTIVATION.md',
    
    // Deprecated Implementation Guides & Dumps
    'FAST_RTC_IMPLEMENTATION.md',
    'HYPERSCALE_IMPLEMENTATION.md',
    'MAKER_IMPLEMENTATION.md',
    'ADA_HYPERSCALE_MASTER_CODEBASE.md',
    'ADA_HYPERSCALE_MASTER_CODEBASE_V5.0.md',
    'Design.md',
    'offline_setup.sh.md',
    
    // Deleted/Empty LLM Artifacts
    'backend/nano.py.md',
    'backend/vhf_radio.py.md',
    'backend/router_edge.py.md',
    'docs/architecture/FAST_RTC_INTEGRATION.md',
    
    // Deprecated Code Components
    'components/CaptainDesk.tsx',
    'services/agents/maintenanceAgent.ts',
    'services/agents/presenterExpert.ts'
];

console.log('🧹 Ada Stargate Cleanup Protocol Initiated...');

// Create .archive directory if it doesn't exist
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
    console.log(`📂 Created archive directory: ${archiveDir}`);
}

filesToArchive.forEach(file => {
    const oldPath = path.join(rootDir, file);
    const fileName = path.basename(file);
    const newPath = path.join(archiveDir, fileName);

    if (fs.existsSync(oldPath)) {
        try {
            // Ensure the directory structure in .archive exists if needed (simplified here to flat archive)
            // For now, we flatten the structure into .archive/ for simplicity 
            // or we could preserve structure. Flattening avoids "mkdir -p" complexity in node without extra deps.
            
            // If a file with the same name exists in archive, overwrite or rename? 
            // Overwriting for now as these are deprecated dumps.
            
            fs.renameSync(oldPath, newPath);
            console.log(`✅ Archived: ${file}`);
        } catch (err) {
            console.error(`❌ Failed to archive ${file}:`, err.message);
        }
    } else {
        // Silent skip or verbose? Keeping silent to reduce noise for already cleaned files.
    }
});

console.log('\n✨ Cleanup complete. Deprecated files moved to .archive/');
