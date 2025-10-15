/**
 * Global TypeScript definitions for JSDoc usage
 * This file makes types from third-party libraries available globally without imports in JSDoc comments
 */

import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { API } from '@hackmd/api';
import type { SingleNote } from '@hackmd/api/dist/type.d.ts';

declare global {
  type HackMDClient = API;
  type HackMDNote = SingleNote;

  // GitHub API type aliases
  type GitHubIssue =
    RestEndpointMethodTypes['issues']['create']['response']['data'];
}
