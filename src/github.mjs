import { Octokit } from '@octokit/rest';

import { DEFAULT_CONFIG } from './constants.mjs';

/**
 * Creates a GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @returns {import('@octokit/rest').Octokit} Configured GitHub API client
 */
export const createGitHubClient = ({ githubToken: auth, verbose }) =>
  new Octokit({ auth, log: verbose ? console : undefined });

/**
 * Creates GitHub issue with meeting information and Google Doc link
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @returns {Promise<GitHubIssue>} Created issue data
 */
export const createGitHubIssue = async (
  { rest },
  { properties },
  title,
  content
) => {
  const githubOrg = properties.USER ?? DEFAULT_CONFIG.githubOrg;

  const issueLabel = properties.ISSUE_LABEL
    ? [properties.ISSUE_LABEL]
    : undefined;

  // Create the GitHub issue with meeting information
  const response = await rest.issues.create({
    owner: githubOrg,
    repo: properties.REPO,
    title,
    body: content,
    labels: issueLabel,
  });

  return response.data;
};

/**
 * Creates or updates a GitHub issue with meeting information and Google Doc link
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - The application config
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @returns {Promise<GitHubIssue>} Created issue data
 */
export const createOrUpdateMeetingIssue = async (
  githubClient,
  { force },
  meetingConfig,
  title,
  content
) => {
  if (!force) {
    const existingIssue = await findIssueByTitle(
      githubClient,
      title,
      meetingConfig
    );

    if (existingIssue) {
      // If content != body, update the issue
      return content === existingIssue.body
        ? existingIssue
        : await updateMeetingIssue(
            githubClient,
            existingIssue.number,
            content,
            meetingConfig
          );
    }
  }

  return createGitHubIssue(githubClient, meetingConfig, title, content);
};

/**
 * Sorts issues by repository
 * @param {Array<GitHubIssue>} issues The issues to sort
 * @returns {Promise<{ [key: string]: Array<GitHubIssue> }>} Sorted issues
 */
export const sortIssuesByRepo = issues =>
  issues.reduce((obj, issue) => {
    (obj[issue.repository_url.split('/').slice(-2).join('/')] ||= []).push(
      issue
    );
    return obj;
  }, {});

/**
 * Updates an existing GitHub issue with new content
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {number} number - The issue number
 * @param {string} content - The new content
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 */
export const updateMeetingIssue = async (
  githubClient,
  number,
  content,
  { properties }
) => {
  const githubOrg = properties.USER ?? DEFAULT_CONFIG.githubOrg;

  return githubClient.issues.update({
    issue_number: number,
    body: content,
    owner: githubOrg,
    repo: properties.REPO,
  });
};

/**
 * Fetches GitHub issue from a repo with a given title
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {string} title - The title to find
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 */
export const findIssueByTitle = async (githubClient, title, { properties }) => {
  const githubOrg = properties.USER ?? DEFAULT_CONFIG.githubOrg;

  const issues = await githubClient.request('GET /search/issues', {
    q: `is:open in:title repo:"${githubOrg}/${properties.REPO}" "${title}"`,
    advanced_search: true,
    per_page: 1,
  });

  return issues.data.items[0];
};

/**
 * Fetches GitHub issues from all repositories in an organization with a specific label
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 * @returns {Promise<{ [key: string]: Array<GitHubIssue> }>} Meeting agenda
 */
export const getAgendaIssues = async (
  githubClient,
  { meetingGroup },
  { properties }
) => {
  const githubOrg = properties.USER ?? DEFAULT_CONFIG.githubOrg;
  const agendaTag = properties.AGENDA_TAG ?? `${meetingGroup}-agenda`;

  // Get all issues/PRs in the organization
  const issues = await githubClient.paginate('GET /search/issues', {
    q: `is:open label:${agendaTag} org:${githubOrg}`,
    advanced_search: true,
  });

  return sortIssuesByRepo(issues);
};
