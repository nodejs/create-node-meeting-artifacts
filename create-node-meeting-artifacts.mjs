#!/usr/bin/env node

/**
 * Node.js Meeting Artifacts Creator
 *
 * Creates a GitHub issue and a HackMD minutes document for a Node.js meeting,
 * driven entirely by a JSON config in meetings/<group>.meeting.json.
 *
 * Usage:
 * npx . tsc
 * node --env-file=.env create-node-meeting-artifacts.mjs tsc --dry-run
 */

import { Command } from 'commander';

import * as calendar from './src/calendar.mjs';
import environmentConfig from './src/config.mjs';
import * as github from './src/github.mjs';
import * as hackmd from './src/hackmd.mjs';
import * as meetings from './src/meeting.mjs';

const program = new Command();
program
  .argument('<group>', 'Meeting group (the meetings/<group>.meeting.json stem)')
  .option('--dry-run', 'Show output without creating/updating anything', false)
  .option('--force', 'Create a new issue even if one already exists', false)
  .option('--verbose', 'Show debug output')
  .parse(process.argv);

// All dates are computed and rendered in UTC.
process.env.TZ = 'UTC';

/** @type {import('./src/types.d.ts').AppConfig} */
const config = {
  ...environmentConfig,
  ...program.opts(),
  meetingGroup: program.args[0],
};

// Load the meeting configuration from its JSON file.
const meeting = await meetings.load(config.meetingGroup);
console.debug('Meeting config loaded', meeting);

// Initialize API clients.
const githubClient = github.createGitHubClient(config);
const hackmdClient = hackmd.createHackMDClient(config, meeting);

// Collect agenda issues for the meeting.
const agendaIssues = await github.getAgendaIssues(githubClient, meeting);
console.debug('Found agenda issues', agendaIssues);

if (config.dryRun) {
  const now = new Date();
  const title = meetings.generateMeetingTitle(meeting, now);

  const issueContent = await meetings.render(
    meetings.createTemplateContext(
      meeting,
      now,
      agendaIssues,
      [{ title: 'Minutes', url: 'https://hackmd.io/<dry-run>' }],
      { title }
    )
  );

  console.log(issueContent);
  process.exit(0);
}

// Find the next meeting occurrence in the calendar.
const events = await calendar.getEventsFromCalendar(meeting.calendar.url);
const meetingDate = await calendar.findNextMeetingDate(events, meeting);
console.debug('Next meeting date', meetingDate);

// If no meeting is found, exit gracefully (expected for non-weekly meetings).
if (!meetingDate) {
  const [weekStart, weekEnd] = calendar.getNextWeek();

  console.log(
    `No meeting found for ${meeting.name} ` +
      `in the next week (${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}). ` +
      `This is expected for bi-weekly meetings or meetings that don't occur every week.`
  );
  process.exit(0);
}

// Build the meeting title.
const meetingTitle = meetings.generateMeetingTitle(meeting, meetingDate);
console.debug('Meeting title', meetingTitle);

// Create (or fetch) the HackMD minutes document and resolve its link.
const hackmdNote = await hackmd.getOrCreateMeetingNotesDocument(
  hackmdClient,
  meetingTitle,
  config
);
const minutesDocLink =
  hackmdNote.publishLink || `https://hackmd.io/${hackmdNote.id}`;
console.debug('HackMD document created/retrieved', minutesDocLink);

// Render and publish the GitHub issue.
const issueContent = await meetings.render(
  meetings.createTemplateContext(
    meeting,
    meetingDate,
    agendaIssues,
    [{ title: 'Minutes', url: minutesDocLink }],
    { title: meetingTitle }
  )
);

const githubIssue = await github.createOrUpdateGitHubIssue(
  githubClient,
  config,
  meeting,
  meetingTitle,
  issueContent
);
console.debug('GitHub issue created/updated', githubIssue.html_url);

// Render the minutes (identical format, plus a back-link to the issue) and
// store it in the HackMD document.
const minutesContent = await meetings.render(
  meetings.createTemplateContext(
    meeting,
    meetingDate,
    agendaIssues,
    [
      { title: 'Minutes', url: minutesDocLink },
      { title: 'GitHub Issue', url: githubIssue.html_url },
    ],
    { isMinutes: true, title: meetingTitle }
  )
);

await hackmd.updateMeetingNotesDocument(
  hackmdClient,
  hackmdNote.id,
  minutesContent
);

// Output success information with links.
console.log(`Created GitHub issue: ${githubIssue.html_url}`);
console.log(`Created HackMD document: ${minutesDocLink}`);
