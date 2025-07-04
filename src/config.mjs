import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_CONFIG } from './constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Gets the application configuration from environment variables and arguments
 * @returns {import('./types.d.ts').AppConfig} Application configuration object
 */
export const getConfig = () => ({
  // Meeting group from command line argument, defaults to 'tsc'
  meetingGroup: process.argv[2] || 'tsc',

  // GitHub personal access token from environment
  githubToken: process.env.GITHUB_TOKEN,

  // Google authentication configuration - supports both OAuth and Service Account
  google: {
    // OAuth credentials for local development
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || DEFAULT_CONFIG.redirectUri,

    // Service Account credentials for GitHub Actions automation
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  },

  // Directory paths for templates, output, and configuration
  directories: {
    config: process.env.MEETINGS_CONFIG_DIR || './',
    output:
      process.env.MEETINGS_OUTPUT_DIR || join(homedir(), '.make-node-meeting'),
    templates: join(dirname(__dirname), 'templates'),
  },
});
