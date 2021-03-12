'use strict';

const gdriveWrapper = require('google-drive-wrapper');

/**
 * Creates a new Google doc from the meeting template.
 * Calls `done(err, body)` with the body of a to-be-created GitHub issue.
 */
exports.upload = (
  minutesDocName,
  {title, googleAuthToken, googleApi, newIssue} = {},
  done
) => {
  const wrapper = new gdriveWrapper(googleAuthToken, googleApi, 'dummy');
  wrapper.getMetaForFilename('/nodejs-meetings', function (err, parentMeta) {
    if (err !== null) {
      return done(
        new Error('Directory called "nodejs-meetings" does not exist, exiting')
      );
    }

    wrapper.uploadFile(
      title,
      minutesDocName,
      {
        parent: parentMeta.id,
        compress: false,
        encrypt: false,
        convert: true,
        mimeType: 'application/vnd.google-apps.document',
      },
      (meta) => {
        newIssue = newIssue
          .toString()
          .replace(
            /\* \*\*Minutes Google Doc\*\*: <>/,
            '* Minutes Google Doc: <https://docs.google.com/document/d/' +
              meta.id +
              '/edit>'
          )
          .replace(/\* _Previous Minutes Google Doc: <>_/, '');
        done(null, newIssue);
      }
    );
  });
};
