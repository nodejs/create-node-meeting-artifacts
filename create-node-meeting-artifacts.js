'use strict'
const fs = require('fs');
const path = require('path');
const process = require('process');
const child_process = require('child_process');
const GitHubApi = require("github");
const ghauth = require('ghauth');
const parser = require('properties-parser');
var googleAuth = require('google-auth-wrapper');
 
const authOptions = { configName: 'iojs-tools', scopes: [ 'user', 'repo'  ] };
const repos       = [] // { org: 'joyent', repo: 'node' } ]

const github = new GitHubApi({
});

ghauth(authOptions, (err, authData) => {
  if (err)
    throw err

  github.authenticate({
    type: "token",
    token: authData.token
  });

  // setup the meeting info
  const meetingGroup = 'TSC';
  const baseMeetingInfo = fs.readFileSync(path.join('templates','meeting_base_' + meetingGroup)); 
  const meetingInfo = baseMeetingInfo.toString() +
                      '\nMEETING_TIME="5pm Oct 25"';
  const meetingProperties = parser.parse(meetingInfo);
  fs.writeFileSync(path.join(process.env.home, '.make-node-meeting/' + meetingGroup + '.sh'), meetingInfo);

  // generate the meeting issue content
  var newIssue = child_process.spawnSync(path.join(__dirname, 'node_modules/make-node-meeting/make-node-meeting.sh'),
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
})
