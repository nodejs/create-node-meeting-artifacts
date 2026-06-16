import HackMDAPI from '@hackmd/api';

import { HACKMD_DEFAULT_PERMISSIONS } from './constants.mjs';

/**
 * Creates a HackMD API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @returns {HackMDAPI} Configured HackMD API client
 */
export const createHackMDClient = ({ hackmd: { apiToken } }, meeting) => {
  // Use the team-specific API endpoint if a team is provided in meeting config
  const teamName = meeting.hackmd?.team;

  const baseURL = teamName
    ? `https://api.hackmd.io/v1/teams/${teamName}`
    : 'https://api.hackmd.io/v1';

  return new HackMDAPI(apiToken, baseURL);
};

/**
 * Creates a new meeting notes document in HackMD with appropriate tags
 * @param {HackMDAPI} hackmdClient - HackMD API client
 * @param {string} title - Document title
 * @param {string} content - Document content in Markdown
 * @returns {Promise<import('@hackmd/api/dist/type.d.ts').SingleNote>} Created note data with ID and URLs
 */
export const createMeetingNotesDocument = (hackmdClient, title, content) => {
  const noteOptions = {
    title,
    content,
    parentFolderId: '',
    ...HACKMD_DEFAULT_PERMISSIONS,
  };

  // apparently it can return either { note: {...} } or just {...}
  return hackmdClient
    .createNote(noteOptions)
    .then(response => response?.note ?? response);
};

/**
 * Fetches or creates a meeting notes document in HackMD
 * @param {HackMDAPI} hackmdClient - HackMD API client
 * @param {string} title - Document title
 * @param {import('./types.d.ts').AppConfig} config - Configuration
 * @returns {Promise<import('@hackmd/api/dist/type.d.ts').SingleNote>} The created / fetched note
 */
export const getOrCreateMeetingNotesDocument = async (
  hackmdClient,
  title,
  { force }
) => {
  if (!force) {
    const notes = await hackmdClient.getNoteList();
    const existingNote = notes.find(note => note.title === title);

    if (existingNote) {
      return existingNote;
    }
  }

  return createMeetingNotesDocument(hackmdClient, title, '');
};

/**
 * Updates an existing meeting notes document in HackMD
 * @param {HackMDAPI} hackmdClient - HackMD API client
 * @param {string} noteId - HackMD note ID
 * @param {string} content - Updated document content in Markdown
 * @returns {Promise<import('@hackmd/api/dist/type.d.ts').SingleNote>} Updated note data
 */
export const updateMeetingNotesDocument = (hackmdClient, noteId, content) => {
  // apparently it can return either { note: {...} } or just {...}
  return hackmdClient
    .updateNote(noteId, { content })
    .then(response => response?.note ?? response);
};
