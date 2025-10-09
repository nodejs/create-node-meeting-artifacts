import { formatTimezones } from './utils/dates.mjs';
import {
  generateTimeAndDateLink,
  generateWolframAlphaLink,
} from './utils/urls.mjs';

/**
 * Loads a meeting configuration file
 * @param {string} meetingGroup
 * @returns {import('./types.d.ts').MeetingConfig}
 */
export const load = async meetingGroup => {
  /** @type {import('./types.d.ts').MeetingConfig} */
  const { default: config } = await import(`../configs/${meetingGroup}.json`, {
    with: { type: 'json' },
  });

  config.github.agendaTag ??= `${meetingGroup}-agenda`;

  return config;
};

/**
 * Generates the meeting title based on the meeting configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig
 * @param {Date} date - Date of the meeting
 * @returns {string} Generated meeting title
 */
export const generateMeetingTitle = ({ meeting }, date) =>
  `${meeting.displayName} Meeting ${date.toISOString().split('T')[0]}`;

/**
 * Creates template context for rendering
 * @param {import('./types.d.ts').MeetingConfig} config - Meeting configuration
 * @param {Date} date - Meeting date
 * @param {Object} agenda - Issues grouped by repository
 * @param {Array<{ title: string, url: string }>} externalURLs - HackMD document URL
 */
export const createTemplateContext = (config, date, agenda, externalURLs) => {
  const { utc, timezones } = formatTimezones(date);

  return {
    config,
    utc,
    timezones,
    agenda,
    externalURLs,
    timeLinks: [
      generateTimeAndDateLink(date, config.meeting.displayName),
      generateWolframAlphaLink(date),
    ],
  };
};
