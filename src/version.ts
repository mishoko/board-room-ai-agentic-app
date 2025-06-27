// Auto-generated version file - DO NOT EDIT MANUALLY
// Updated: 2025-06-27T05:43:15.524Z

export const VERSION = '1.1.0';
export const BUILD_DATE = '2025-06-27T05:43:15.524Z';
export const BUILD_TIMESTAMP = 1751002995524;

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
export const getLongVersion = () => `v${VERSION} (${new Date(BUILD_DATE).toLocaleDateString()})`;
export const getFullVersionString = () => `AI Agentic Boardroom v${VERSION} - Built ${new Date(BUILD_DATE).toLocaleDateString()}`;
