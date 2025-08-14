#!/usr/bin/env node

/**
 * Node.js Meeting Artifacts Creator
 *
 * Creates GitHub issues and HackMD documents for Node.js team meetings.
 * Reads meeting configuration from templates, fetches calendar events,
 * creates meeting minutes documents, and posts GitHub issues.
 *
 * Environment Variables Required:
 * - GITHUB_TOKEN: Personal access token for GitHub API
 * - HACKMD_API_TOKEN: HackMD API token for creating documents
 * - GOOGLE_API_KEY: Google Calendar API key for read-only calendar access
 *
 * Optional Environment Variables:
 * - HACKMD_TEAM_NAME: HackMD team name/path (optional)
 * - MEETINGS_CONFIG_DIR: Directory containing meeting templates (default: ./)
 * - MEETINGS_OUTPUT_DIR: Directory for meeting output files (default: ~/.make-node-meeting/)
 *
 * Usage:
 * node create-node-meeting-artifacts.mjs [meetingGroup]
 * npm run tsc-meeting
 * npm run dev -- tsc
 */

import { getConfig } from './src/config.mjs';
import * as github from './src/github.mjs';
import * as google from './src/google.mjs';
import * as hackmd from './src/hackmd.mjs';
import * as meetings from './src/meeting.mjs';

// Step 1: Application configuration
const config = getConfig();

// Step 2: Initialize Google Calendar client with API Key
const calendarClient = google.createGoogleCalendarClient(config.google);

// Step 3: Initialize HackMD client
const hackmdClient = hackmd.createHackMDClientInstance(
  config.hackmd.apiToken,
  config.hackmd.teamName
);

// Step 4: Read meeting configuration from templates
const meetingConfig = await meetings.readMeetingConfig(config);

// Step 5: Find next meeting event in calendar
const event = await google.findNextMeetingEvent(calendarClient, meetingConfig);

// Step 6: Extract meeting date from event
const meetingDate = new Date(event.start.dateTime);

// Step 7: Get Meeting Title
const meetingTitle = meetings.generateMeetingTitle(
  config,
  meetingConfig,
  meetingDate
);

// Step 8: Generate meeting issue content using native implementation
const issueContent = await meetings.generateMeetingIssue(
  config,
  meetingConfig,
  meetingDate
);

// Step 9: Create GitHub issue with HackMD link
const githubIssue = await github.createGitHubIssue(
  config,
  meetingConfig,
  meetingTitle,
  issueContent
);

// Step 10: Create HackMD document with meeting notes
const hackmdNote = await hackmd.createMeetingNotesDocument(
  hackmdClient,
  meetingTitle,
  ''
);

// Step 11: Get the HackMD document link
const noteLink = hackmdNote.publishLink || `https://hackmd.io/${hackmdNote.id}`;

// Step 12: Update the minutes content with the HackMD link
const minutesContent = await meetings.generateMeetingMinutes(
  config,
  meetingConfig,
  meetingTitle,
  noteLink,
  githubIssue.html_url
);

// Step 13: Update the HackMD document with the self-referencing link
await hackmd.updateMeetingNotesDocument(
  hackmdClient,
  hackmdNote.id,
  minutesContent
);

// Output success information with links
console.log(`Created GitHub issue: ${githubIssue.html_url}`);
console.log(`Created HackMD document: ${noteLink}`);
