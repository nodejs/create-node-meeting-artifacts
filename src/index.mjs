#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import { Command } from 'commander';
import mustache from 'mustache';

import envConfig from './config.mjs';
import * as github from './github.mjs';
import * as google from './google.mjs';
import * as hackmd from './hackmd.mjs';
import * as meetings from './meeting.mjs';

const program = new Command();
program
  .argument('[group]', 'Meeting group', 'tsc')
  .option('--dry-run', 'Show output without creating/updating anything', false)
  .parse(process.argv);

/** @type {import('./types.d.ts').AppConfig} */
const config = {
  ...envConfig,
  ...program.opts(),
  meetingGroup: program.args[0],
};

// Initialize Google Calendar client with API Key
const calendarClient = google.createCalendarClient(config.google);

// Initialize GitHub client
const githubClient = github.createGitHubClient(config);

// Read meeting configuration from templates
const meetingConfig = await meetings.load(config.meetingGroup);

// Initialize HackMD client with meeting configuration
const hackmdClient = hackmd.createHackMDClient(config, meetingConfig);

// Find next meeting event in calendar
const event = await google.findNextMeetingEvent(calendarClient, meetingConfig);

// Extract meeting date from event
const meetingDate = new Date(event.start.dateTime);

// Get Meeting Title
const meetingTitle = meetings.generateMeetingTitle(meetingConfig, meetingDate);

// Get agenda information using native implementation
const gitHubAgendaIssues = await github.getAgendaIssues(
  githubClient,
  meetingConfig
);

// Create HackMD document with meeting notes and tags
let hackmdNote;
if (config.dryRun) {
  hackmdNote = { id: 'dry-run', publishLink: 'https://hackmd.io/dry-run' };
  console.log('[dry-run] Would create HackMD meeting notes document.');
} else {
  hackmdNote = await hackmd.createMeetingNotesDocument(
    hackmdClient,
    meetingTitle,
    ''
  );
}

// Get the HackMD document link
const minutesDocLink =
  hackmdNote.publishLink || `https://hackmd.io/${hackmdNote.id}`;

// Create the template context
const templateContext = meetings.createTemplateContext(
  meetingConfig,
  meetingDate,
  gitHubAgendaIssues,
  [{ title: 'Minutes', url: minutesDocLink }]
);

// Generate meeting issue content
const template = await readFile(
  new URL(import.meta.resolve('../template.mustache')),
  'utf-8'
);
const issueContent = mustache.render(template, templateContext);

// Create the actual issue
let githubIssue;
if (config.dryRun) {
  githubIssue = { html_url: 'https://github.com/dry-run/issue' };
  console.log('[dry-run] Would create GitHub issue with title:', meetingTitle);
  console.log('[dry-run] Would use the following content:\n', issueContent);
} else {
  githubIssue = await github.createGitHubIssue(
    githubClient,
    meetingConfig,
    meetingTitle,
    issueContent
  );
}

// Add the issue URL to the context
templateContext.externalURLs.push({
  title: 'GitHub Issue',
  url: githubIssue.html_url,
});

// Create the notes
const minutesContent = mustache.render(template, templateContext);

// Update the HackMD document with the self-referencing link
if (config.dryRun) {
  console.log(
    '[dry-run] Would update HackMD document with self-referencing link.'
  );
  console.log(
    '[dry-run] Would use the following notes content:\n',
    minutesContent
  );
} else {
  await hackmd.updateMeetingNotesDocument(
    hackmdClient,
    hackmdNote.id,
    minutesContent
  );
}

// Output success information with links
if (config.dryRun) {
  console.log('Dry run mode: no data was created or updated.');
} else {
  console.log(`Created GitHub issue: ${githubIssue.html_url}`);
  console.log(`Created HackMD document: ${minutesDocLink}`);
}
