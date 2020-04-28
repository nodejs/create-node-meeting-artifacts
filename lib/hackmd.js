'use strict';

const {execSync, spawnSync} = require('child_process');

/**
 * Creates a new HackMD doc from the meeting template.
 * Calls `done(err, body)` with the body of a to-be-created GitHub issue.
 * 
 * For this to work, `process.env` must contain `CMD_CLI_ID=<email>` where `<email>` is
 * a HackMD username, and `CMD_CLI_PASSWORD=<password>` where `<password>` is the HackMD
 * user's password.
 * 
 * @see https://npm.im/@hackmd/codimd-cli
 */
exports.upload = (filepath, {newIssue: body} = {}, done) => {
  console.log('Logging in to HackMD...');
  try {
    // this places a token in ~/.codimd/cookies.json
    spawnSync('node', ['node_modules/.bin/codimd-cli', 'login']);
  } catch (err) {
    return done(err);
  }
  console.log('Importing minutes doc...');
  try {
    const result = execSync(
      `cat "${filepath}" | node_modules/.bin/codimd-cli`
    ).toString('utf8');
    // the result will be a string containing a URL.  grab it
    const url = result.match(/(https:.+?)[\s\S]/)[1];
    if (!url) {
      return done(new Error(`Could not parse URL from codimd-cli result:\n${result}`));
    }
    body = body
      .toString()
      .replace(
        /\* \*\*Minutes(?:[\s\S]+?)Doc\*\*: <>/,
        `* Minutes HackMD Doc: ${url}`
      )
      .replace(/\* _Previous Minutes(?:[\s\S]+?)Doc: <>_/, '');
    done(null, body);
  } catch (err) {
    done(err);
  }
};
