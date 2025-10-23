#!/usr/bin/env node

/**
 * Node.js Meeting Artifacts Creator
 *
 * Usage:
 * node create-node-meeting-artifacts.mjs [meetingGroup]
 * npm run tsc-meeting
 * npm run dev -- tsc
 */

import { Command } from 'commander';

import * as calendar from './src/calendar.mjs';
import environmentConfig from './src/config.mjs';
import * as github from './src/github.mjs';
import * as hackmd from './src/hackmd.mjs';
import * as meetings from './src/meeting.mjs';

const program = new Command();
program
  .argument('<group>', 'Meeting group')
  .option('--dry-run', 'Show output without creating/updating anything', false)
  .option('--force', 'Create a new issue even if one already exists', false)
  .option('--verbose', 'Show debug output')
  .parse(process.argv);

// Step 1: Application configuration
/** @type {import('./src/types').AppConfig} */
const config = {
  ...environmentConfig,
  ...program.opts(),
  meetingGroup: program.args[0],
};

// Step 3: Initialize GitHub client
const githubClient = github.createGitHubClient(config);

// Step 4: Read meeting configuration from templates
const meetingConfig = await meetings.readMeetingConfig(config);

// Step 5: Initialize HackMD client with meeting configuration
const hackmdClient = hackmd.createHackMDClient(config, meetingConfig);

if (config.dryRun) {
  const gitHubAgendaIssues = await github.getAgendaIssues(
    githubClient,
    config,
    meetingConfig
  );

  const meetingAgenda = meetings.generateMeetingAgenda(gitHubAgendaIssues);

  const issueContent = await meetings.generateMeetingIssue(
    config,
    meetingConfig,
    new Date(),
    meetingAgenda,
    ''
  );

  console.log(issueContent);

  process.exit(0);
}

// Step 6: Find next meeting event in calendar
const meetingDate = await calendar.findNextMeetingDate(meetingConfig);

if (!meetingDate) {
  process.exit(0);
}

// Step 8: Get Meeting Title
const meetingTitle = meetings.generateMeetingTitle(
  config,
  meetingConfig,
  meetingDate
);

// Look for existing issues
if (!config.force) {
  const existingIssue = await github.findIssueByTitle(
    githubClient,
    meetingTitle,
    meetingConfig
  );

  if (existingIssue) {
    console.log(`${existingIssue.html_url} already exists. Exiting.`);
    process.exit(0);
  }
}

process.exit(0);
// Step 9: Get agenda information using native implementation
const gitHubAgendaIssues = await github.getAgendaIssues(
  githubClient,
  config,
  meetingConfig
);

// Step 10: Parse meeting agenda from GitHub issues
const meetingAgenda = meetings.generateMeetingAgenda(gitHubAgendaIssues);

// Step 11: Create HackMD document with meeting notes and tags
const hackmdNote = await hackmd.createMeetingNotesDocument(
  hackmdClient,
  meetingTitle,
  ''
);

// Step 12: Get the HackMD document link
const minutesDocLink =
  hackmdNote.publishLink || `https://hackmd.io/${hackmdNote.id}`;

// Step 13: Generate meeting issue content using native implementation
const issueContent = await meetings.generateMeetingIssue(
  config,
  meetingConfig,
  meetingDate,
  meetingAgenda,
  minutesDocLink
);

// Step 14: Create GitHub issue with HackMD link
const githubIssue = await github.createGitHubIssue(
  githubClient,
  meetingConfig,
  meetingTitle,
  issueContent
);

// Step 15: Update the minutes content with the HackMD link
const minutesContent = await meetings.generateMeetingMinutes(
  config,
  meetingConfig,
  meetingTitle,
  meetingAgenda,
  minutesDocLink,
  githubIssue.html_url
);

// Step 16: Update the HackMD document with the self-referencing link
await hackmd.updateMeetingNotesDocument(
  hackmdClient,
  hackmdNote.id,
  minutesContent
);

// Output success information with links
console.log(`Created GitHub issue: ${githubIssue.html_url}`);
console.log(`Created HackMD document: ${minutesDocLink}`);
