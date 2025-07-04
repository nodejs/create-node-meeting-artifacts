/**
 * Global TypeScript definitions for JSDoc usage
 * This file makes types from third-party libraries available globally without imports in JSDoc comments
 */

import type { calendar_v3 } from '@googleapis/calendar';
import type { drive_v3 } from '@googleapis/drive';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { GoogleAuth } from 'google-auth-library';

declare global {
  // Google API type aliases
  type CalendarEvent = calendar_v3.Schema$Event;
  type CalendarClient = calendar_v3.Calendar;
  type DriveFile = drive_v3.Schema$File;
  type DriveClient = drive_v3.Drive;
  type GoogleAuthClient = GoogleAuth;

  // GitHub API type aliases
  type GitHubIssue =
    RestEndpointMethodTypes['issues']['create']['response']['data'];
}
