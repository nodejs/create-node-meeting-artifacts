import { readFile } from 'node:fs/promises';

import mustache from 'mustache';

import { CALENDAR_PAGES, DEFAULT_HOST, OPENJS_HOST } from './constants.mjs';
import * as dates from './utils/dates.mjs';
import * as urls from './utils/urls.mjs';

// The single template shared by every meeting issue and every minutes document.
const TEMPLATE_URL = new URL('../templates/meeting.mustache', import.meta.url);

/**
 * Resolves the path to a meeting config for a given group
 * @param {string} group - Meeting group identifier
 * @returns {URL} The config file URL
 */
export const configURL = group =>
  new URL(`../meetings/${group}.meeting.json`, import.meta.url);

/**
 * Loads and normalizes a meeting configuration from its JSON file
 * @param {string} group - Meeting group identifier (the config filename stem)
 * @returns {Promise<import('./types.d.ts').MeetingConfig>} Meeting configuration object
 */
export const load = async group => {
  /** @type {import('./types.d.ts').MeetingConfig} */
  const meeting = JSON.parse(await readFile(configURL(group), 'utf8'));

  // Apply defaults so every config exposes an identical, fully-populated shape.
  meeting.group = group;
  meeting.host ??= DEFAULT_HOST;
  meeting.github.agendaLabel ??= `${group}-agenda`;
  meeting.observers ??= [];
  meeting.agenda ??= [];

  return meeting;
};

/**
 * Generates the meeting title based on the meeting configuration
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @param {Date} meetingDate - Date of the meeting
 * @returns {string} Generated meeting title
 */
export const generateMeetingTitle = (meeting, meetingDate) => {
  const host = meeting.host ?? DEFAULT_HOST;
  const name = meeting.name ?? meeting.group;

  const utcShort = meetingDate.toISOString().split('T')[0];

  return `${host} ${name} Meeting ${utcShort}`;
};

/**
 * Escapes characters that would break markdown link syntax in issue titles
 * @param {string} title - The raw issue title
 * @returns {string} The escaped title
 */
const escapeTitle = title =>
  title.replace(/\\/g, '\\\\').replace(/([\[\]])/g, '\\$1');

/**
 * Resolves the public "add to your calendar" page for a meeting
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @returns {string} The calendar page URL
 */
export const calendarPage = meeting =>
  meeting.calendar.page ??
  (meeting.host === OPENJS_HOST ? CALENDAR_PAGES.openjs : CALENDAR_PAGES.node);

/**
 * Formats a date's UTC time of day as `HH:MM`
 * @param {Date} date - The date
 * @returns {string} The UTC time, e.g. "13:00"
 */
const utcTimeOfDay = date =>
  `${String(date.getUTCHours()).padStart(2, '0')}:${String(
    date.getUTCMinutes()
  ).padStart(2, '0')}`;

/**
 * Resolves the joining details for a specific meeting occurrence.
 *
 * For meetings that alternate between sessions (e.g. the TSC's 13:00 UTC and
 * 17:00 UTC slots, each with its own Zoom link), the session whose `time`
 * matches the occurrence's UTC time of day is selected. When no session matches
 * (such as a `--dry-run` with no real occurrence), every session is listed.
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @param {Date} meetingDate - Date of the meeting occurrence
 * @returns {{ participant?: string, observer?: string, notes?: string, sessions?: object[] }} Resolved joining details
 */
export const resolveJoining = (meeting, meetingDate) => {
  const { participant, observer, notes, sessions } = meeting.joining;

  if (!sessions?.length) {
    return { participant, observer, notes };
  }

  const match = sessions.find(
    session => session.time === utcTimeOfDay(meetingDate)
  );

  return match
    ? { participant: match.participant, observer, notes }
    : { observer, notes, sessions };
};

/**
 * Builds the rendering context shared by the issue and minutes templates
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @param {Date} meetingDate - Date of the meeting
 * @param {Array<import('./types.d.ts').AgendaGroup>} agenda - Agenda issues grouped by repo
 * @param {Array<{ title: string, url: string }>} links - External links (minutes, issue)
 * @param {{ isMinutes?: boolean, title?: string }} options - Rendering options
 * @returns {object} The mustache rendering context
 */
export const createTemplateContext = (
  meeting,
  meetingDate,
  agenda,
  links,
  { isMinutes = false, title = '' } = {}
) => {
  const { utc, timezones } = dates.formatTimezones(meetingDate);

  return {
    meeting,
    title,
    utc,
    timezones,
    timeAndDateLink: urls.generateTimeAndDateLink(meetingDate, meeting.name),
    wolframLink: urls.generateWolframAlphaLink(meetingDate),
    agendaLabel: meeting.github.agendaLabel,
    owner: meeting.github.owner,
    calendarPage: calendarPage(meeting),
    joining: resolveJoining(meeting, meetingDate),
    agenda: agenda.map(({ repo, issues }) => ({
      repo,
      issues: issues.map(issue => ({
        number: issue.number,
        title: escapeTitle(issue.title),
        html_url: issue.html_url,
      })),
    })),
    hasAgenda: agenda.some(({ issues }) => issues.length > 0),
    links,
    isMinutes,
  };
};

/**
 * Renders meeting content (issue or minutes) from the shared template
 * @param {object} context - The rendering context from createTemplateContext
 * @returns {Promise<string>} The rendered markdown
 */
export const render = async context => {
  const template = await readFile(TEMPLATE_URL, 'utf8');

  return mustache.render(template, context);
};
