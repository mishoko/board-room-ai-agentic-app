#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get current version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`📝 Generating changelog entry for v${currentVersion}`);

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const currentDate = new Date().toISOString().split('T')[0];

// Create new changelog entry
const newEntry = `## [${currentVersion}] - ${currentDate}

### 🚀 Features
- Enhanced AI executive agents with real-time contextual responses
- Dynamic conversation pacing based on meeting duration (1-30+ minutes)
- Sophisticated boardroom simulation with C-level domain expertise
- Advanced topic state management with completion tracking
- Real-time AI integration for contextual, challenging discussions

### 🎯 Improvements
- Immediate conversation start (no delays when entering boardroom)
- Duration-aware message timing and conversation flow
- Enhanced executive response sophistication and critical thinking
- Better hover controls for reading speech bubbles
- Improved topic validation and setup guidance

### 🔧 Technical
- Implemented proper Node.js version tracking system
- Added automated changelog generation
- Enhanced LLM service with real-time AI integration
- Improved topic state management with duration-based targets
- Better conversation context and history management

### 🐛 Bug Fixes
- Fixed conversation startup delays
- Improved message duration calculations
- Better handling of user interruptions and context switching
- Enhanced topic completion criteria based on duration

### 📚 Documentation
- Added comprehensive version tracking documentation
- Improved setup and configuration guides
- Enhanced code comments and technical documentation

---

`;

// Read existing changelog or create new one
let existingChangelog = '';
if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, 'utf8');
}

// If changelog doesn't exist, create header
if (!existingChangelog) {
  existingChangelog = `# Changelog

All notable changes to the AI Agentic Boardroom Interface will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

// Insert new entry after header
const headerEnd = existingChangelog.indexOf('\n\n') + 2;
const newChangelog = existingChangelog.slice(0, headerEnd) + newEntry + existingChangelog.slice(headerEnd);

fs.writeFileSync(changelogPath, newChangelog);

console.log(`✅ Changelog updated with v${currentVersion} entry`);
console.log(`📄 Entry added to CHANGELOG.md`);
console.log(`📅 Release date: ${currentDate}`);