import HackMDAPI from '@hackmd/api';

import { HACKMD_DEFAULT_PERMISSIONS } from './constants.mjs';

/**
 * Creates a HackMD API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 * @returns {HackMDClient} Configured HackMD API client
 */
export const createHackMDClient = ({ hackmd: { apiToken } }, meetingConfig) => {
  // Use team-specific API endpoint if teamName is provided in meeting config
  const teamName = meetingConfig.properties.HACKMD_TEAM_NAME;

  const baseURL = teamName
    ? `https://api.hackmd.io/v1/teams/${teamName}`
    : 'https://api.hackmd.io/v1';

  return new HackMDAPI(apiToken, baseURL);
};

/**
 * Creates a new meeting notes document in HackMD
 * @param {HackMDAPI} hackmdClient - HackMD API client
 * @param {string} title - Document title
 * @param {string} content - Document content in Markdown
 * @returns {Promise<HackMDNote>} Created note data with ID and URLs
 */
export const createMeetingNotesDocument = (hackmdClient, title, content) =>
  hackmdClient.createNote({ title, content, ...HACKMD_DEFAULT_PERMISSIONS });

/**
 * Updates an existing meeting notes document in HackMD
 * @param {HackMDClient} hackmdClient - HackMD API client
 * @param {string} noteId - HackMD note ID
 * @param {string} content - Updated document content in Markdown
 * @returns {Promise<HackMDNote>} Updated note data
 */
export const updateMeetingNotesDocument = (hackmdClient, noteId, content) =>
  hackmdClient.updateNote(noteId, { content });
