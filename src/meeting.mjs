import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { DEFAULT_CONFIG } from './constants.mjs';
import * as github from './github.mjs';
import * as dates from './utils/dates.mjs';
import * as templates from './utils/templates.mjs';
import * as urls from './utils/urls.mjs';

/**
 * Reads and parses meeting configuration from template files
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @returns {Promise<import('./types.d.ts').MeetingConfig>} Meeting configuration object
 */
export const readMeetingConfig = async config => {
  // Read all template files asynchronously
  const invited = await readFile(
    join(config.directories.templates, `invited_${config.meetingGroup}`),
    'utf8'
  );

  const observers = await readFile(
    join(config.directories.templates, `observers_${config.meetingGroup}`),
    'utf8'
  );

  const baseMeetingInfo = await readFile(
    join(config.directories.templates, `meeting_base_${config.meetingGroup}`),
    'utf8'
  );

  return {
    invited,
    observers,
    baseMeetingInfo,
    properties: templates.parseMeetingProperties(baseMeetingInfo),
  };
};

/**
 * Generates the meeting title based on the meeting configuration
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig
 * @param {Date} meetingDate - Date of the meeting
 * @returns {Promise<string>} Generated meeting title
 */
export const generateMeetingTitle = (config, meetingConfig, meetingDate) => {
  const props = meetingConfig.properties;

  const host = props.HOST ?? DEFAULT_CONFIG.defaultHost;
  const groupName = props.GROUP_NAME ?? config.meetingGroup;

  const utcShort = meetingDate.toISOString().split('T')[0];

  return `${host} ${groupName} Meeting ${utcShort}`;
};

/**
 * Generates meeting issue content directly (replaces make-node-meeting.sh)
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 * @param {Date} meetingDate - Date of the meeting
 */
export const generateMeetingIssue = async (
  config,
  meetingConfig,
  meetingDate
) => {
  const props = meetingConfig.properties;

  const joiningInstructions = props.JOINING_INSTRUCTIONS ?? '';
  const githubOrg = props.USER ?? DEFAULT_CONFIG.githubOrg;

  const groupName = props.GROUP_NAME ?? config.meetingGroup;
  const agendaTag = props.AGENDA_TAG ?? `${config.meetingGroup}-agenda`;

  // Format the meeting date and timezones
  const { utc, timezones } = dates.formatTimezones(meetingDate);

  // Generate timezone conversion links
  const timeAndDateLink = urls.generateTimeAndDateLink(meetingDate, groupName);
  const wolframLink = urls.generateWolframAlphaLink(meetingDate);

  // Fetch agenda issues from GitHub
  const agendaContent = await github.fetchAgendaIssues(
    config.githubToken,
    githubOrg,
    agendaTag
  );

  // Generate timezone table
  const timezoneTable = timezones
    .map(({ label, time }) => `| ${label.padEnd(13)} | ${time} |`)
    .join('\n');

  // Read and process the meeting issue template
  const templatePath = join(config.directories.templates, 'meeting_issue.md');

  const template = await readFile(templatePath, 'utf8');

  const templateVariables = {
    UTC_TIME: utc,
    TIMEZONE_TABLE: timezoneTable,
    TIME_AND_DATE_LINK: timeAndDateLink,
    WOLFRAM_ALPHA_LINK: wolframLink,
    AGENDA_LABEL: agendaTag,
    GITHUB_ORG: githubOrg,
    AGENDA_CONTENT: agendaContent ?? '*No agenda items found.*',
    INVITEES: meetingConfig.invited,
    JOINING_INSTRUCTIONS: joiningInstructions,
    OBSERVERS: meetingConfig.observers ?? '',
  };

  return templates.parseVariables(template, templateVariables);
};

/**
 * Creates meeting minutes document content by processing template
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 * @param {string} meetingTitle - Meeting title
 * @param {string} minutesDocLink - Minutes document link (optional)
 * @param {string} githubIssueLink - GitHub issue link (optional)
 * @returns {Promise<string>} Processed minutes document content
 */
export const generateMeetingMinutes = async (
  config,
  meetingConfig,
  meetingTitle,
  minutesDocLink = '$MINUTES_DOC$',
  githubIssueLink = '$GITHUB_ISSUE$'
) => {
  const props = meetingConfig.properties;

  const githubOrg = props.USER ?? DEFAULT_CONFIG.githubOrg;

  const agendaTag = props.AGENDA_TAG ?? `${config.meetingGroup}-agenda`;

  // Get agenda information using native implementation
  const agendaInfo = await github.fetchAgendaIssues(
    config.githubToken,
    githubOrg,
    agendaTag
  );

  // Read and process the meeting minutes template
  const templatePath = join(
    config.directories.templates,
    `minutes_base_${config.meetingGroup}`
  );

  const template = await readFile(templatePath, 'utf8');

  const templateVariables = {
    TITLE: meetingTitle,
    AGENDA_CONTENT: agendaInfo,
    INVITED: meetingConfig.invited,
    OBSERVERS: meetingConfig.observers,
    MINUTES_DOC: minutesDocLink,
    GITHUB_ISSUE: githubIssueLink,
  };

  return templates.parseVariables(template, templateVariables);
};
