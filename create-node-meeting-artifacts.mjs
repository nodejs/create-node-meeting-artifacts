#!/usr/bin/env node

/**
 * Node.js Meeting Artifacts Creator
 *
 * Creates GitHub issues and Google Docs for Node.js team meetings.
 * Reads meeting configuration from templates, fetches calendar events,
 * creates meeting minutes documents, and posts GitHub issues.
 *
 * Environment Variables Required:
 * - GITHUB_TOKEN: Personal access token for GitHub API
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 *
 * Optional Environment Variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email (for GitHub Actions)
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Service account private key (for GitHub Actions)
 * - GOOGLE_REDIRECT_URI: OAuth redirect URI (default: http://localhost:3000/oauth2callback)
 * - MEETINGS_CONFIG_DIR: Directory containing meeting templates (default: ./)
 * - MEETINGS_OUTPUT_DIR: Directory for meeting output files (default: ~/.make-node-meeting/)
 *
 * Usage:
 * node create-node-meeting-artifacts.mjs [meetingGroup]
 * npm run tsc-meeting
 * npm run dev -- tsc
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getConfig } from './src/config.mjs';
import { createGitHubIssue } from './src/github.mjs';
import {
  createGoogleAuthClient,
  createGoogleClients,
  findNextMeetingEvent,
  uploadMinutesDocument,
} from './src/google.mjs';
import {
  readMeetingConfig,
  generateMeetingIssue,
  createMinutesDocument,
  createMeetingInfoString,
} from './src/meeting.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Step 1: Application configuration
const config = getConfig();

// Step 2: Initialize Google authentication and API clients
const googleAuth = createGoogleAuthClient(config.google);
const { calendarClient, driveClient } = await createGoogleClients(googleAuth);

// Step 3: Read meeting configuration from templates
const meetingConfig = await readMeetingConfig(
  config.meetingGroup,
  config.directories.templates
);

// Step 4: Find next meeting event in calendar
const event = await findNextMeetingEvent(calendarClient, meetingConfig);
const meetingTime = new Date(event.start.dateTime).toISOString();

// Step 5: Generate meeting information string for external tools
const meetingInfo = createMeetingInfoString(meetingConfig, meetingTime);

// Step 6: Generate meeting issue content using make-node-meeting tool
const makeNodeMeetingPath = join(
  __dirname,
  'node_modules/make-node-meeting/make-node-meeting.sh'
);

const { title, content } = await generateMeetingIssue(
  meetingConfig.meetingGroupForTag,
  meetingInfo,
  config.directories.output,
  makeNodeMeetingPath
);

// Step 7: Create minutes document content using node-meeting-agenda tool
const agendaToolPath = join(
  __dirname,
  'node_modules/node-meeting-agenda/node-meeting-agenda.js'
);

const minutesContent = await createMinutesDocument(
  meetingConfig.meetingGroupForTag,
  meetingConfig.githubOrg,
  meetingConfig,
  title,
  config.directories.templates,
  config.meetingGroup,
  agendaToolPath
);

// Step 8: Upload minutes document to Google Drive
const uploadResult = await uploadMinutesDocument(
  driveClient,
  title,
  minutesContent
);

// Step 9: Create GitHub issue with Google Doc link
const issue = await createGitHubIssue(
  config.githubToken,
  meetingConfig,
  title,
  content,
  uploadResult.id
);

// Output success information with links
console.log(`Created GitHub issue: ${issue.html_url}`);
console.log(`Doc: https://docs.google.com/document/d/${uploadResult.id}`);
