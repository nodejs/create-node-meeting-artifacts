/**
 * Global TypeScript definitions for JSDoc usage
 * This file makes types from third-party libraries available globally without imports in JSDoc comments
 */

import type { calendar_v3 } from '@googleapis/calendar';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { HackMDAPI } from '@hackmd/api';
import type { SingleNote } from '@hackmd/api/dist/type.d.ts';

declare global {
  // Google API type aliases
  type CalendarEvent = calendar_v3.Schema$Event;
  type CalendarClient = calendar_v3.Calendar;
  type HackMDClient = HackMDAPI;
  type HackMDNote = SingleNote;

  // GitHub API type aliases
  type GitHubIssue =
    RestEndpointMethodTypes['issues']['create']['response']['data'];
}
