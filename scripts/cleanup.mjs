
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const archiveDir = path.join(rootDir, '.archive');

console.log('🧹 Ada Stargate Intelligent Cleanup Protocol Initiated...');

// 1. Ensure Archive Directory Exists
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
    console.log(`📂 Created archive directory: ${archiveDir}`);
}

// 2. Specific large documentation dumps to move explicitly
const specificFiles = [
    'ahmetengin.md',
    'PROJECT_STATUS_SNAPSHOT.md',
    'TODO_HYPERSCALE_ACTIVATION.md',
    'FAST_RTC_IMPLEMENTATION.md',
    'HYPERSCALE_IMPLEMENTATION.md',
    'MAKER_IMPLEMENTATION.md',
    'ADA_HYPERSCALE_MASTER_CODEBASE.md',
    'ADA_HYPERSCALE_MASTER_CODEBASE_V5.0.md',
    'Design.md',
    'offline_setup.sh.md',
    'deploy.md',
    'installation.md',
    'EnvSample.md',
    'DOCKER_SETUP.md',
    'LLM_CONTEXT.md',
    'HYPERSCALE_GUIDE.md',
    'USER_MANUAL.md',
    // Deprecated Components
    'components/CaptainDesk.tsx',
    'services/agents/maintenanceAgent.ts',
    'services/agents/presenterExpert.ts',
    'services/agents/presenterAgent.ts'
];

// 3. Recursive function to find artifact files (e.g., .py.md, .yml.md, .json.md)
function findArtifacts(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip node_modules, .git, and .archive to prevent recursion/damage
        if (file === 'node_modules' || file === '.git' || file === '.archive' || file === 'dist') {
            return;
        }

        if (stat.isDirectory()) {
            findArtifacts(filePath, fileList);
        } else {
            // Logic: Identify files that look like code dumps (double extension ending in .md)
            // Examples: main.py.md, config.ts.md, docker-compose.yml.md
            if (file.endsWith('.py.md') || 
                file.endsWith('.ts.md') || 
                file.endsWith('.tsx.md') || 
                file.endsWith('.json.md') || 
                file.endsWith('.yml.md') || 
                file.endsWith('.yaml.md') ||
                file.endsWith('.conf.md') ||
                file.endsWith('.sh.md') ||
                file.endsWith('Dockerfile.md')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

// 4. Execute Move Operation
const moveFile = (srcPath) => {
    if (fs.existsSync(srcPath)) {
        const fileName = path.basename(srcPath);
        let destPath = path.join(archiveDir, fileName);

        // Avoid overwriting existing files in archive by prepending timestamp
        if (fs.existsSync(destPath)) {
            destPath = path.join(archiveDir, `${Date.now()}_${fileName}`);
        }

        try {
            fs.renameSync(srcPath, destPath);
            console.log(`📦 Archived: ${path.relative(rootDir, srcPath)}`);
        } catch (err) {
            console.error(`❌ Failed to archive ${fileName}:`, err.message);
        }
    }
};

// Process Specific Files
specificFiles.forEach(file => {
    moveFile(path.join(rootDir, file));
});

// Process Detected Artifacts
const artifacts = findArtifacts(rootDir);
if (artifacts.length > 0) {
    console.log(`\n🔍 Detected ${artifacts.length} code artifact files (e.g. *.py.md)...`);
    artifacts.forEach(filePath => {
        moveFile(filePath);
    });
} else {
    console.log('\n✅ No code artifacts (*.py.md, etc.) found.');
}

// 5. Cleanup Empty Directories (Optional)
const cleanEmptyDirs = (dir) => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        if (files.length > 0) {
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    cleanEmptyDirs(fullPath);
                }
            });
        }
        
        // Re-check if empty after cleaning children
        if (fs.readdirSync(dir).length === 0) {
            // Don't delete crucial source folders even if empty
            if (!dir.endsWith('src') && !dir.endsWith('public')) {
                try {
                    fs.rmdirSync(dir);
                    console.log(`🗑️ Removed empty directory: ${path.relative(rootDir, dir)}`);
                } catch (e) {}
            }
        }
    }
};

// Run directory cleanup on backend/skills and other likely places
cleanEmptyDirs(path.join(rootDir, 'backend'));
cleanEmptyDirs(path.join(rootDir, '.claude'));

console.log('\n✨ Cleanup complete. Your workspace is now focused.');
