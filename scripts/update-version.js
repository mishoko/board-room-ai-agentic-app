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

console.log(`📦 Updating version to ${currentVersion}`);

// Update version in src/version.ts
const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');
const versionFileContent = `// Auto-generated version file - DO NOT EDIT MANUALLY
// Updated: ${new Date().toISOString()}

export const VERSION = '${currentVersion}';
export const BUILD_DATE = '${new Date().toISOString()}';
export const BUILD_TIMESTAMP = ${Date.now()};

// Version utilities
export const getVersionInfo = () => ({
  version: VERSION,
  buildDate: BUILD_DATE,
  buildTimestamp: BUILD_TIMESTAMP,
  major: parseInt(VERSION.split('.')[0]),
  minor: parseInt(VERSION.split('.')[1]),
  patch: parseInt(VERSION.split('.')[2])
});

// Check if this is a development build
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Version display utilities
export const getShortVersion = () => VERSION;
export const getLongVersion = () => \`v\${VERSION} (\${new Date(BUILD_DATE).toLocaleDateString()})\`;
export const getFullVersionString = () => \`AI Agentic Boardroom v\${VERSION} - Built \${new Date(BUILD_DATE).toLocaleDateString()}\`;
`;

fs.writeFileSync(versionFilePath, versionFileContent);

// Update version in index.html
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Update the title to include version
indexHtml = indexHtml.replace(
  /<title>.*<\/title>/,
  `<title>AI Agentic Boardroom Interface v${currentVersion}</title>`
);

// Add version meta tag
if (!indexHtml.includes('<meta name="version"')) {
  indexHtml = indexHtml.replace(
    '<meta name="viewport"',
    `<meta name="version" content="${currentVersion}" />\n    <meta name="viewport"`
  );
} else {
  indexHtml = indexHtml.replace(
    /<meta name="version" content="[^"]*"/,
    `<meta name="version" content="${currentVersion}"`
  );
}

fs.writeFileSync(indexHtmlPath, indexHtml);

console.log(`✅ Version ${currentVersion} updated in:`);
console.log(`   - package.json`);
console.log(`   - src/version.ts`);
console.log(`   - index.html`);
console.log(`   - Build timestamp: ${new Date().toISOString()}`);