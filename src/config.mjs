import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const defaultMeetingsDirectory = join(homedir(), '.make-node-meeting');

/**
 * @type {import('./types.d.ts').EnvironmentConfig} Environment configuration object
 */
export default {
  // GitHub personal access token from environment
  githubToken: process.env.GITHUB_TOKEN,

  // Google authentication configuration - now uses API Keys for simplicity
  google: {
    // Google API Key for Calendar access (preferred method)
    apiKey: process.env.GOOGLE_API_KEY,
  },

  // HackMD configuration for meeting notes
  hackmd: {
    // HackMD API token for authentication
    apiToken: process.env.HACKMD_API_TOKEN,
  },

  // Directory paths for templates, output, and configuration
  directories: {
    config: process.env.MEETINGS_CONFIG_DIR || './',
    output: process.env.MEETINGS_OUTPUT_DIR || defaultMeetingsDirectory,
    templates: join(dirname(import.meta.dirname), 'templates'),
  },
};
