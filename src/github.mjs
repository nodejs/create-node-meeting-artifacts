import { Octokit } from '@octokit/rest';

import { DEFAULT_CONFIG } from './constants.mjs';

/**
 * Creates a GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @returns {import('@octokit/rest').Octokit} Configured GitHub API client
 */
export const createGitHubClient = ({ githubToken: auth }) =>
  new Octokit({ auth });

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
