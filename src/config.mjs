/**
 * @type {import('./types.d.ts').AppConfig} Environment configuration object
 */
export default {
  // GitHub personal access token from environment
  githubToken: process.env.GITHUB_TOKEN,

  // HackMD configuration for meeting notes
  hackmd: {
    // HackMD API token for authentication
    apiToken: process.env.HACKMD_API_TOKEN,
  },
};
