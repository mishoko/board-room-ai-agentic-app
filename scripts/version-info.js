#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`
🚀 AI Agentic Boardroom Interface - Version Information
${'='.repeat(60)}

📦 Package Information:
   Name: ${packageJson.name}
   Version: ${packageJson.version}
   Description: ${packageJson.description}
   License: ${packageJson.license}

🔧 Technical Details:
   Node.js: ${process.version}
   Platform: ${process.platform}
   Architecture: ${process.arch}

📋 Version Components:
   Major: ${packageJson.version.split('.')[0]}
   Minor: ${packageJson.version.split('.')[1]}
   Patch: ${packageJson.version.split('.')[2]}
`);

// Try to get git information
try {
  const gitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const gitTags = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();
  
  console.log(`🌿 Git Information:
   Branch: ${gitBranch}
   Commit: ${gitHash.substring(0, 8)}
   Tags: ${gitTags || 'none'}
`);
} catch (error) {
  console.log(`🌿 Git Information: Not available (not a git repository)
`);
}

// Check if version file exists
const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');
if (fs.existsSync(versionFilePath)) {
  const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
  const buildDateMatch = versionFileContent.match(/BUILD_DATE = '([^']+)'/);
  const buildTimestampMatch = versionFileContent.match(/BUILD_TIMESTAMP = (\d+)/);
  
  if (buildDateMatch && buildTimestampMatch) {
    const buildDate = new Date(buildDateMatch[1]);
    const buildTimestamp = parseInt(buildTimestampMatch[1]);
    const timeSinceBuild = Date.now() - buildTimestamp;
    const daysSinceBuild = Math.floor(timeSinceBuild / (1000 * 60 * 60 * 24));
    
    console.log(`🏗️  Build Information:
   Build Date: ${buildDate.toLocaleString()}
   Build Age: ${daysSinceBuild} days ago
   Timestamp: ${buildTimestamp}
`);
  }
}

console.log(`📚 Available Scripts:
   npm run version:patch    - Increment patch version (1.0.0 → 1.0.1)
   npm run version:minor    - Increment minor version (1.0.0 → 1.1.0)
   npm run version:major    - Increment major version (1.0.0 → 2.0.0)
   npm run release:patch    - Full patch release (version + changelog + tag)
   npm run release:minor    - Full minor release (version + changelog + tag)
   npm run release:major    - Full major release (version + changelog + tag)
   npm run changelog        - Generate changelog entry
   npm run version:info     - Show this information

🎯 Quick Release Commands:
   npm run release:patch    - For bug fixes and small improvements
   npm run release:minor    - For new features and enhancements
   npm run release:major    - For breaking changes and major updates

${'='.repeat(60)}
`);