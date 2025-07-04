import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import parser from 'properties-parser';

import { DEFAULT_CONFIG } from './constants.mjs';
import {
  executeCommand,
  createMeetingInfo,
  processMinutesTemplate,
} from './utils.mjs';

/**
 * Reads and parses meeting configuration from template files
 * @param {string} meetingGroup - The meeting group name
 * @param {string} templatesDir - Directory containing template files
 * @returns {Promise<import('./types.d.ts').MeetingConfig>} Meeting configuration object
 */
export const readMeetingConfig = async (meetingGroup, templatesDir) => {
  // Read all template files asynchronously
  const invited = await readFile(
    join(templatesDir, `invited_${meetingGroup}`),
    'utf8'
  );

  const observers = await readFile(
    join(templatesDir, `observers_${meetingGroup}`),
    'utf8'
  );

  const baseMeetingInfo = await readFile(
    join(templatesDir, `meeting_base_${meetingGroup}`),
    'utf8'
  );

  // Parse meeting properties from the base info
  const meetingProperties = parser.parse(baseMeetingInfo);

  return {
    invited,
    observers,
    baseMeetingInfo,
    properties: meetingProperties,
    meetingGroupForTag: meetingProperties.AGENDA_TAG
      ? meetingProperties.AGENDA_TAG.replace('-agenda', '')
      : meetingGroup,
    githubOrg: meetingProperties.GITHUB_ORG
      ? meetingProperties.GITHUB_ORG.replace(/"/g, '')
      : DEFAULT_CONFIG.githubOrg,
  };
};

/**
 * Generates meeting issue content using make-node-meeting tool
 * @param {string} meetingGroupForTag - Meeting group tag for file naming
 * @param {string} meetingInfo - Complete meeting information string
 * @param {string} outputDir - Output directory for meeting files
 * @param {string} toolPath - Path to make-node-meeting tool
 * @returns {Promise<import('./types.d.ts').MeetingIssueResult>} Object containing issue title and content
 */
export const generateMeetingIssue = async (
  meetingGroupForTag,
  meetingInfo,
  outputDir,
  toolPath
) => {
  // Write meeting info to file for make-node-meeting tool
  const meetingConfigPath = join(outputDir, `${meetingGroupForTag}.sh`);

  await writeFile(meetingConfigPath, meetingInfo);

  // Generate issue content using external tool
  const newIssue = await executeCommand('bash', [toolPath, meetingGroupForTag]);

  // Parse title and content from tool output
  const issueLines = newIssue.split('\n');
  const title = issueLines[1];
  const content = issueLines.slice(4).join('\n');

  return { title, content };
};

/**
 * Creates meeting minutes document content by processing template
 * @param {string} meetingGroupForTag - Meeting group tag for agenda generation
 * @param {string} githubOrg - GitHub organization name
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} title - Meeting title
 * @param {string} templatesDir - Templates directory path
 * @param {string} meetingGroup - Original meeting group name
 * @param {string} agendaToolPath - Path to node-meeting-agenda tool
 * @returns {Promise<string>} Processed minutes document content
 */
export const createMinutesDocument = async (
  meetingGroupForTag,
  githubOrg,
  meetingConfig,
  title,
  templatesDir,
  meetingGroup,
  agendaToolPath
) => {
  // Get agenda information using external tool
  const agendaInfo = await executeCommand('node', [
    agendaToolPath,
    `${meetingGroupForTag}-agenda`,
    githubOrg,
  ]);

  // Read minutes template file asynchronously
  const minutesDoc = await readFile(
    join(templatesDir, `minutes_base_${meetingGroup}`),
    'utf8'
  );

  // Process template variables and return final document
  return processMinutesTemplate(
    minutesDoc,
    title,
    agendaInfo,
    meetingConfig.invited,
    meetingConfig.observers
  );
};

/**
 * Creates complete meeting information string for make-node-meeting tool
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} meetingTime - ISO string of meeting time
 * @returns {string} Complete meeting information for tool consumption
 */
export const createMeetingInfoString = (meetingConfig, meetingTime) =>
  createMeetingInfo(
    meetingConfig.baseMeetingInfo,
    meetingTime,
    meetingConfig.invited,
    meetingConfig.observers
  );
