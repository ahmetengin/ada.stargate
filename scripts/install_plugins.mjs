
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, '.claude', 'plugins');
const tempDir = path.join(rootDir, 'temp_cc_plugins');
const REPO_URL = 'https://github.com/ccplugins/awesome-claude-code-plugins.git';

console.log('🔌 ADA STARGATE: CLAUDE PLUGIN INSTALLER');
console.log('----------------------------------------');
console.log(`🎯 Target: ${targetDir}`);
console.log(`🌍 Source: ${REPO_URL}`);

// 1. Ensure Target Directory Exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📂 Created directory: .claude/plugins`);
}

// 2. Clone Repository
console.log(`\n⬇️  Cloning external repository...`);
try {
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    // Attempt clone
    execSync(`git clone --depth 1 ${REPO_URL} "${tempDir}"`, { stdio: 'inherit' });
} catch (e) {
    console.error(`\n❌ CRITICAL ERROR: Git clone failed.`);
    console.error(`   Please ensure 'git' is installed and you have internet access.`);
    exit(1);
}

// 3. Install Plugins
console.log(`\n📦 Installing plugins...`);
const excludeList = ['.git', '.github', 'assets', 'images', 'docs', 'LICENSE', 'README.md'];
let count = 0;

try {
    const items = fs.readdirSync(tempDir);
    
    items.forEach(item => {
        const srcPath = path.join(tempDir, item);
        const stat = fs.statSync(srcPath);

        // Only move directories that are not in the exclude list
        if (stat.isDirectory() && !excludeList.includes(item)) {
            const destPath = path.join(targetDir, item);
            
            // Clean destination if exists (update mode)
            if (fs.existsSync(destPath)) {
                fs.rmSync(destPath, { recursive: true, force: true });
            }

            // Move directory
            // Note: fs.renameSync can fail across partitions, so we use recursive copy + rm as fallback or logic
            try {
                fs.cpSync(srcPath, destPath, { recursive: true });
                console.log(`   ✅ Installed: ${item}`);
                count++;
            } catch (copyErr) {
                console.error(`   ⚠️ Failed to copy ${item}: ${copyErr.message}`);
            }
        }
    });

} catch (err) {
    console.error(`❌ Error processing plugins: ${err.message}`);
}

// 4. Cleanup
console.log(`\n🧹 Cleaning up temporary files...`);
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('----------------------------------------');
if (count > 0) {
    console.log(`✨ Success! ${count} plugins installed into .claude/plugins/`);
    console.log(`👉 You may need to restart Claude Code or run 'ada tools refresh' if applicable.`);
} else {
    console.log(`⚠️  No plugins found or repository structure was unexpected.`);
}
