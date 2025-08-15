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
 * Fetches GitHub issues from all repositories in an organization with a specific label
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration
 * @returns {Promise<{ repoName: string, issues: Array<GitHubIssue> }> } Formatted markdown string of issues
 */
export const getAgendaIssues = async (
  { paginate, rest },
  { meetingGroup },
  { properties }
) => {
  const githubOrg = properties.USER ?? DEFAULT_CONFIG.githubOrg;
  const agendaTag = properties.AGENDA_TAG ?? `${meetingGroup}-agenda`;

  // Get all public repositories in the organization
  const repos = await paginate(rest.repos.listForOrg, {
    org: properties.USER,
    type: 'public',
    per_page: 100,
  });

  // Fetch issues from all repositories concurrently
  const issuePromises = repos.map(async repo => {
    const issues = await paginate(rest.issues.listForRepo, {
      owner: githubOrg,
      repo: repo.name,
      labels: agendaTag,
      state: 'open',
      per_page: 100,
    });

    const filteredIssues = issues.filter(({ pull_request }) => !pull_request); // Exclude PRs

    return { repoName: repo.name, issues: filteredIssues };
  });

  return Promise.all(issuePromises);
};
