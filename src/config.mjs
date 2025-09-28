/**
 * Gets the application configuration from environment variables and arguments
 * @type {import('./types.d.ts').AppConfig} Application configuration object
 */
export default {
  // Meeting group from command line argument, defaults to 'tsc'
  meetingGroup: process.argv[2],

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
};
