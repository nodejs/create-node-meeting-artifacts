import { spawn } from 'node:child_process';

import dedent from 'dedent';

import { TEMPLATE_VARIABLES, ISSUE_UPDATE_REGEXES } from './constants.mjs';

/**
 * Executes a shell command asynchronously
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @returns {Promise<string>} Command output
 */
export const executeCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    // Spawn child process to execute the command
    const process = spawn(command, args);

    let stdout = '';
    let stderr = '';

    // Collect stdout data as it comes in
    process.stdout.on('data', data => {
      stdout += data.toString();
    });

    // Collect stderr data for error reporting
    process.stderr.on('data', data => {
      stderr += data.toString();
    });

    process.on('close', code => {
      if (code === 0) {
        return resolve(stdout);
      }

      reject(new Error(`Command failed with code ${code}: ${stderr}`));
    });
  });
};

/**
 * Creates meeting information string using template
 * @param {string} baseMeetingInfo - Base meeting information
 * @param {string} meetingTime - ISO string of meeting time
 * @param {string} invited - Invited attendees
 * @param {string} observers - Observers
 * @returns {string} Complete meeting information
 */
export const createMeetingInfo = (
  baseMeetingInfo,
  meetingTime,
  invited,
  observers
) => dedent`
    ${baseMeetingInfo}MEETING_TIME="${meetingTime}"
    INVITEES="${invited}

    ### Observers/Guests
    ${observers}"
  `;

/**
 * Replaces template variables in minutes document
 * @param {string} minutesDoc - Minutes document template
 * @param {string} title - Meeting title
 * @param {string} agendaInfo - Agenda information
 * @param {string} invited - Invited attendees
 * @param {string} observers - Observers
 * @returns {string} Processed minutes document
 */
export const processMinutesTemplate = (
  minutesDoc,
  title,
  agendaInfo,
  invited,
  observers
) => {
  // Replace all template placeholders with actual content
  return minutesDoc
    .replace(TEMPLATE_VARIABLES.TITLE, title)
    .replace(TEMPLATE_VARIABLES.AGENDA_CONTENT, agendaInfo)
    .replace(TEMPLATE_VARIABLES.INVITED, invited)
    .replace(TEMPLATE_VARIABLES.OBSERVERS, observers);
};

/**
 * Updates issue content with Google Doc link and cleans up placeholders
 * @param {string} content - Original issue content
 * @param {string} documentId - Google Doc ID
 * @returns {string} Updated content
 */
export const updateIssueContent = (content, documentId) =>
  content
    // Replace empty Google Doc placeholder with actual link
    .replace(
      ISSUE_UPDATE_REGEXES.EMPTY_GOOGLE_DOC,
      `* Minutes Google Doc: <https://docs.google.com/document/d/${documentId}/edit>`
    )
    // Remove previous minutes placeholder line
    .replace(ISSUE_UPDATE_REGEXES.PREVIOUS_MINUTES, '');
