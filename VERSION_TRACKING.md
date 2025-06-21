# Version Tracking Documentation

This document explains the comprehensive version tracking system implemented for the AI Agentic Boardroom Interface project.

## 📦 Overview

The project uses **Semantic Versioning (SemVer)** with automated tooling for version management, changelog generation, and Git tagging.

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, major feature overhauls
- **MINOR**: New features, enhancements, backward-compatible changes
- **PATCH**: Bug fixes, small improvements, documentation updates

## 🚀 Quick Start

### Increment Version
```bash
# Patch version (1.0.0 → 1.0.1) - for bug fixes
npm run version:patch

# Minor version (1.0.0 → 1.1.0) - for new features
npm run version:minor

# Major version (1.0.0 → 2.0.0) - for breaking changes
npm run version:major
```

### Full Release Process
```bash
# Complete patch release (version + changelog + git tag)
npm run release:patch

# Complete minor release
npm run release:minor

# Complete major release
npm run release:major
```

### View Version Information
```bash
# Show detailed version and build information
npm run version:info
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run version:patch` | Increment patch version only |
| `npm run version:minor` | Increment minor version only |
| `npm run version:major` | Increment major version only |
| `npm run version:update` | Update version in all files (auto-called) |
| `npm run version:tag` | Create Git tag for current version |
| `npm run changelog` | Generate changelog entry |
| `npm run release:patch` | Full patch release workflow |
| `npm run release:minor` | Full minor release workflow |
| `npm run release:major` | Full major release workflow |
| `npm run version:info` | Display version information |

## 📁 Files Updated by Version System

### Automatically Updated Files
1. **`package.json`** - Main version field
2. **`src/version.ts`** - Version constants and utilities
3. **`index.html`** - Version meta tag and title
4. **`CHANGELOG.md`** - Release notes and history

### Version File (`src/version.ts`)
```typescript
export const VERSION = '1.0.0';
export const BUILD_DATE = '2024-12-19T20:30:00.000Z';
export const BUILD_TIMESTAMP = 1734640200000;

// Utility functions for version display
export const getVersionInfo = () => ({ ... });
export const getShortVersion = () => VERSION;
export const getLongVersion = () => `v${VERSION} (date)`;
```

## 🏷️ Git Integration

### Automatic Git Operations
When running `npm run release:*` commands:

1. **Commit Changes**: All version-related files are committed
2. **Create Annotated Tag**: Git tag with detailed release notes
3. **Structured Messages**: Consistent commit and tag messages

### Manual Git Operations
After running release commands:
```bash
# Push changes and tags
git push origin main --tags

# Or separately
git push origin main
git push origin v1.0.0
```

## 📝 Changelog Management

### Automatic Generation
- Changelog entries are automatically generated
- Follows [Keep a Changelog](https://keepachangelog.com/) format
- Includes categorized changes (Features, Improvements, Bug Fixes, etc.)

### Manual Customization
Edit `CHANGELOG.md` after generation to:
- Add specific feature descriptions
- Include breaking change notes
- Add migration guides
- Reference issue numbers

## 🎯 UI Integration

### Version Badge
- Displays current version in bottom-right corner
- Shows development/production environment
- Clickable for detailed version information

### Version Info Modal
- Complete version and build details
- Build date and age information
- Environment and feature information
- Accessible via version badge click

## 🔄 Release Workflow

### 1. Development Phase
```bash
# Work on features, make commits
git add .
git commit -m "feat: add new executive agent"
```

### 2. Ready for Release
```bash
# For new features
npm run release:minor

# For bug fixes
npm run release:patch

# For breaking changes
npm run release:major
```

### 3. Post-Release
```bash
# Push to remote
git push origin main --tags

# Verify release
npm run version:info
```

## 📊 Version Information Display

### In Application
- Version badge always visible
- Click for detailed build information
- Development vs production indicators

### Command Line
```bash
npm run version:info
```
Shows:
- Package information
- Version components
- Git information (if available)
- Build details
- Available commands

## 🛠️ Customization

### Modify Version Scripts
Edit `scripts/` directory files:
- `update-version.js` - Version file updates
- `create-version-tag.js` - Git tagging logic
- `generate-changelog.js` - Changelog generation
- `version-info.js` - Information display

### Custom Changelog Entries
Modify the changelog template in `scripts/generate-changelog.js`:
```javascript
const newEntry = `## [${currentVersion}] - ${currentDate}

### 🚀 Features
- Your custom features here

### 🐛 Bug Fixes
- Your bug fixes here
`;
```

## 🔍 Troubleshooting

### Common Issues

**Git not available:**
- Version updates work without Git
- Manual Git operations required

**Permission errors:**
- Ensure scripts have execute permissions
- Run `chmod +x scripts/*.js` if needed

**Version conflicts:**
- Check for uncommitted changes
- Ensure clean working directory

### Debug Information
```bash
# Check current version
npm run version:info

# Verify Git status
git status

# Check recent tags
git tag -l --sort=-version:refname | head -5
```

## 📚 Best Practices

### When to Increment Versions

**Patch (1.0.0 → 1.0.1):**
- Bug fixes
- Documentation updates
- Small UI improvements
- Performance optimizations

**Minor (1.0.0 → 1.1.0):**
- New features
- New executive agents
- Enhanced functionality
- Backward-compatible changes

**Major (1.0.0 → 2.0.0):**
- Breaking API changes
- Major architecture changes
- Removed features
- Incompatible updates

### Release Notes Quality
- Use clear, user-focused language
- Group related changes together
- Include migration notes for breaking changes
- Reference relevant documentation

### Git Workflow
- Keep commits atomic and focused
- Use conventional commit messages
- Test before releasing
- Tag releases consistently

---

This version tracking system ensures consistent, professional version management for the AI Agentic Boardroom Interface project.