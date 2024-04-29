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
const gdriveWrapper = require('google-drive-wrapper');
const meetingGroup = process.argv[2] || 'tsc';
 
const authOptions = { configName: 'iojs-tools', scopes: [ 'user', 'repo'  ] };
const repos       = [];

let githubOrg = 'nodejs';

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
    const invited = fs.readFileSync(path.join('templates',
                                              'invited_' +
                                              meetingGroup)).toString();
    const observers = fs.readFileSync(path.join('templates',
                                      'observers_' +
                                       meetingGroup)).toString();
    const baseMeetingInfo = fs.readFileSync(path.join('templates',
                                                      'meeting_base_' +
                                                       meetingGroup));
    const meetingProperties = parser.parse(baseMeetingInfo);

    var meetingGroupForTag = meetingGroup;
    if (meetingProperties.AGENDA_TAG) {
      meetingGroupForTag = meetingProperties.AGENDA_TAG.replace('-agenda', '');
    }

    if (meetingProperties.GITHUB_ORG) {
      githubOrg = meetingProperties.GITHUB_ORG.replace(/"/g, '');
    }

    // find the next meeting instance in the google calendar. We assume 1 meeting
    // in the next week
    const calendar = google.calendar('v3');
    calendar.events.list({
      auth: googleAuthToken,
      calendarId: meetingProperties.CALENDAR_ID.replace(/"/g, ''),
      timeMin: (new Date()).toISOString(),
      timeMax: (new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toISOString(),
      singleEvents: true,
      q: meetingProperties.CALENDAR_FILTER.replace(/"/g, '').replace(/ /g, '.'),
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
                            'MEETING_TIME="' + meetingTime + '"\n' +
                            'INVITEES="' +
                            invited + 
                            '\n' +
                            '### Observers/Guests\n' +
                            observers +
                            '"';

        fs.writeFileSync(
            path.join(process.env.HOME,
                      '.make-node-meeting/' + meetingGroupForTag + '.sh'),
                      meetingInfo);

        // generate the meeting issue content with make-node-meeting
        var newIssue = child_process.spawnSync(
            path.join(__dirname, 'node_modules/make-node-meeting/make-node-meeting.sh'),
            [ meetingGroupForTag ]).stdout.toString();

        // parse out the title
        const issueLines = newIssue.split('\n');
        const title = issueLines[1];
        newIssue = issueLines.splice(4).join('\n');


        // create the minutes document
        const agendaInfo = child_process.spawnSync(
            'node',
            ['node_modules/node-meeting-agenda/node-meeting-agenda.js',
              meetingGroupForTag +  '-agenda', githubOrg]).stdout.toString();
        let minutesDoc =  fs.readFileSync(path.join('templates',
                                                    'minutes_base_' +
                                                     meetingGroup)).toString();

        minutesDoc = minutesDoc.replace('$TITLE$', title);
        minutesDoc = minutesDoc.replace('$AGENDA_CONTENT$', agendaInfo);
        minutesDoc = minutesDoc.replace('$INVITED$', invited);
        minutesDoc = minutesDoc.replace('$OBSERVERS$', observers);
        const minutesDocName = path.join(__dirname, 'minutes_temp.txt');
        fs.writeFileSync( minutesDocName, minutesDoc);

        // upload the minutes doc
        const wrapper = new gdriveWrapper(googleAuthToken, google, 'dummy' );
        wrapper.getMetaForFilename('/nodejs-meetings', function(err, parentMeta) {
          if (err !== null) {
            console.log('Directory called "nodejs-meetings" does not exist, exiting');
            process.exit(-1);
          }

          wrapper.uploadFile(title, minutesDocName,
                             { parent: parentMeta.id,
                               compress: false,
                               encrypt: false,
                               convert: true,
                               mimeType: 'application/vnd.google-apps.document' },
                             function(err, meta) {
            if (err !== null) {
              console.log('Failed to upload minutes file');
              console.log(err);
            } else {
              // create the issue in github
              newIssue = newIssue.toString().replace(
                  /\* \*\*Minutes Google Doc\*\*: <>/,
                  '* Minutes Google Doc: <https://docs.google.com/document/d/' + meta.id + '/edit>');
              newIssue = newIssue.replace(/\* _Previous Minutes Google Doc: <>_/,'');
              let issueLabel = (meetingProperties.ISSUE_LABEL || '').replace(/"/g, '');
                github.issues.create({
                owner: meetingProperties.USER.replace(/"/g, ''),
                repo: meetingProperties.REPO.replace(/"/g, ''),
                title: title,
                body: newIssue,
                assignee: "mhdawson",
                labels: issueLabel ? [issueLabel] : undefined
              });
            }
          });
        });
      }
    });
  });
})
