import HackMDAPI from '@hackmd/api';

import { HACKMD_DEFAULT_PERMISSIONS } from './constants.mjs';

/**
 * Creates a HackMD API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @returns {HackMDClient} Configured HackMD API client
 */
export const createHackMDClient = ({ hackmd: { apiToken } }) => {
  return new HackMDAPI(apiToken);
};

/**
 * Creates a new meeting notes document in HackMD with appropriate tags
 * @param {HackMDAPI} hackmdClient - HackMD API client
 * @param {string} title - Document title
 * @param {string} content - Document content in Markdown
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration for tags
 * @returns {Promise<HackMDNote>} Created note data with ID and URLs
 */
export const createMeetingNotesDocument = (
  hackmdClient,
  title,
  content,
  meetingConfig
) => {
  const meetingTag =
    meetingConfig?.properties?.GROUP_NAME ??
    meetingConfig?.properties?.AGENDA_TAG;

  const teamName = meetingConfig?.properties?.HACKMD_TEAM_NAME;

  const noteOptions = {
    title,
    content,
    tags: [meetingTag, 'Meetings'],
    ...HACKMD_DEFAULT_PERMISSIONS,
  };

  if (teamName) {
    return hackmdClient.createTeamNote(teamName, noteOptions);
  }

  return hackmdClient.createNote(noteOptions);
};

/**
 * Updates an existing meeting notes document in HackMD with retry logic
 * @param {HackMDClient} hackmdClient - HackMD API client
 * @param {string} noteId - HackMD note ID
 * @param {string} content - Updated document content in Markdown
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration for team context
 * @returns {Promise<HackMDNote>} Updated note data
 */
export const updateMeetingNotesDocument = (
  hackmdClient,
  noteId,
  content,
  meetingConfig
) => {
  const teamName = meetingConfig?.properties?.HACKMD_TEAM_NAME;

  if (teamName) {
    return hackmdClient.updateTeamNote(teamName, noteId, { content });
  }

  return hackmdClient.updateNote(noteId, { content });
};
