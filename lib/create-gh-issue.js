'use strict';

/**
 * Creates a callback function which accepts an issue `body` argument.
 * `body` will be used in a new GitHub issue containing meeting information.
 */
exports.createGithubIssueCallback = (title, meetingProperties, done) => (err, body) => {
  if (err) {
    err.message = `Failed to upload minutes file:\n${err.message}`;
    return done(err);
  }
  github.issues.create({
    owner: meetingProperties.USER.replace(/"/g, ''),
    repo: meetingProperties.REPO.replace(/"/g, ''),
    title: title,
    body,
    assignee: 'mhdawson',
  });
  done();
};
