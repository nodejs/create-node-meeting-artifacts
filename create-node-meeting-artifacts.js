'use strict'
const fs = require('fs');
const path = require('path');
const process = require('process');
const child_process = require('child_process');
const GitHubApi = require("github");
const ghauth = require('ghauth');
const parser = require('properties-parser');
const gcal = require('google-calendar');
const googleAuth = require('google-auth-wrapper');
 
const authOptions = { configName: 'iojs-tools', scopes: [ 'user', 'repo'  ] };
const repos       = [];

const github = new GitHubApi({
});

ghauth(authOptions, (err, authData) => {
  if (err) {
    throw err;
  }

  // first authenticate to google and github
  googleAuth.execute('./', 'client_secret', (googleAuthToken, google) => {
    github.authenticate({
      type: "token",
      token: authData.token
    });

    // ok all authenticated

    // read in the configuration for the meeting
    const meetingGroup = 'TSC';
    const baseMeetingInfo = fs.readFileSync(path.join('templates',
                                                      'meeting_base_' +
                                                       meetingGroup));
    const meetingProperties = parser.parse(baseMeetingInfo);

    // find the next meeting instance in the google calendar. We assume 1 meeting
    // in the next week
    const calendar = google.calendar('v3');
    calendar.events.list({
      auth: googleAuthToken,
      calendarId: meetingProperties.CALENDAR_ID.replace(/"/g, ''),
      timeMin: (new Date()).toISOString(),
      timeMax: (new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toISOString(),
      singleEvents: true,
      q: meetingProperties.CALENDAR_FILTER.replace(/"/g, ''),
      maxResults: 1,
    }, (err, response) => {
      if (err) {
        throw err;
      }

      const events = response.items;
      if (events.length == 0) {
        console.log('Could not find calendar event');
      } else {
        // extract the time and complete the meeting info for make-node-meeting
        const meetingTime = (new Date(events[0].start.dateTime)).toISOString();
        const meetingInfo = baseMeetingInfo.toString() +
                            'MEETING_TIME="' + meetingTime + '"';
        fs.writeFileSync(
            path.join(process.env.HOME,
                      '.make-node-meeting/' + meetingGroup + '.sh'),
                      meetingInfo);

        // generate the meeting issue content with make-node-meeting1
        var newIssue = child_process.spawnSync(
            path.join(__dirname, 'node_modules/make-node-meeting/make-node-meeting.sh'),
            [ meetingGroup ]).stdout.toString();

        // parse out the title
        const issueLines = newIssue.split('\n');
        const title = issueLines[1];
        newIssue = issueLines.splice(4).join('\n');

        // create the issue in github
        github.issues.create({
          owner: meetingProperties.USER.replace(/"/g, ''),
          repo: meetingProperties.REPO.replace(/"/g, ''),
          title: title,
          body: newIssue.toString(),
          assignee: "mhdawson"
        });
      }
    });
  });
})
