import HackMDAPI from '@hackmd/api';

/**
 * Creates the default permissions for our generated docs
 * @type {Pick<import('@hackmd/api/dist/type.d.ts').CreateNoteOptions, 'readPermission' | 'writePermission' | 'commentPermission'>} */
const hackMdPermissions = {
  readPermission: 'guest', // Allow signed-in users to read
  writePermission: 'signed_in', // Allow signed-in users to write
  commentPermission: 'signed_in_users', // Allow signed-in users to comment
};

/**
 * Creates a HackMD API client
 * @param {string} apiToken - HackMD API token
 * @param {string} teamPath - HackMD team path/name (optional)
 * @returns {HackMDClient} Configured HackMD API client
 */
export const createHackMDClientInstance = (apiToken, teamPath) => {
  // Use team-specific API endpoint if teamPath is provided
  const baseURL = teamPath
    ? `https://api.hackmd.io/v1/teams/${teamPath}`
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
export const createMeetingNotesDocument = (hackmdClient, title, content) => {
  // Create a new note with the meeting content
  return hackmdClient.createNote({ title, content, ...hackMdPermissions });
};

/**
 * Updates an existing meeting notes document in HackMD
 * @param {HackMDClient} hackmdClient - HackMD API client
 * @param {string} noteId - HackMD note ID
 * @param {string} content - Updated document content in Markdown
 * @returns {Promise<HackMDNote>} Updated note data
 */
export const updateMeetingNotesDocument = (hackmdClient, noteId, content) =>
  hackmdClient.updateNote(noteId, { content });
