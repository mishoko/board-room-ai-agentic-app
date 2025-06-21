#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get current version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`🏷️  Creating version tag for v${currentVersion}`);

try {
  // Check if we're in a git repository
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  
  // Add all changes
  execSync('git add .', { stdio: 'inherit' });
  
  // Commit version changes
  const commitMessage = `chore: bump version to ${currentVersion}

- Updated package.json version
- Updated src/version.ts with build info
- Updated index.html with version meta
- Generated changelog entry

[skip ci]`;
  
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  // Create annotated tag
  const tagMessage = `Release v${currentVersion}

AI Agentic Boardroom Interface
Version: ${currentVersion}
Build Date: ${new Date().toISOString()}

Features and improvements in this release:
- Enhanced executive AI agents with real-time contextual responses
- Dynamic conversation pacing based on meeting duration
- Sophisticated boardroom simulation with C-level expertise
- Advanced topic state management and completion tracking
- Real-time AI integration for contextual discussions

For detailed changes, see CHANGELOG.md`;

  execSync(`git tag -a v${currentVersion} -m "${tagMessage}"`, { stdio: 'inherit' });
  
  console.log(`✅ Successfully created version tag v${currentVersion}`);
  console.log(`📝 Commit message: ${commitMessage.split('\n')[0]}`);
  console.log(`🏷️  Tag created with detailed release notes`);
  console.log(`\n📋 Next steps:`);
  console.log(`   - Push changes: git push origin main`);
  console.log(`   - Push tags: git push origin v${currentVersion}`);
  console.log(`   - Or push both: git push origin main --tags`);
  
} catch (error) {
  if (error.message.includes('not a git repository')) {
    console.log(`⚠️  Not in a git repository. Creating version info without git tag.`);
    console.log(`📝 Version ${currentVersion} is ready for manual git operations.`);
  } else {
    console.error(`❌ Error creating version tag:`, error.message);
    process.exit(1);
  }
}