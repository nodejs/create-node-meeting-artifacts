import { Octokit } from '@octokit/rest';

import { DEFAULT_CONFIG } from './constants.mjs';
import { updateIssueContent } from './utils.mjs';

/**
 * Creates GitHub issue with meeting information and Google Doc link
 * @param {string} githubToken - GitHub personal access token
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @param {string} documentId - Google Doc ID to link in issue
 * @returns {Promise<GitHubIssue>} Created issue data
 */
export const createGitHubIssue = async (
  githubToken,
  meetingConfig,
  title,
  content,
  documentId
) => {
  // Initialize GitHub API client with authentication token
  const octokit = new Octokit({ auth: githubToken });

  // Update the issue content to include the Google Doc link and clean up placeholders
  const updatedContent = updateIssueContent(content, documentId);

  // Extract issue label from config, removing quotes if present
  const issueLabel = meetingConfig.properties.ISSUE_LABEL?.replace(/"/g, '');

  // Create the GitHub issue with meeting information
  const response = await octokit.rest.issues.create({
    // Repository information from meeting config
    owner: meetingConfig.properties.USER?.replace(/"/g, ''),
    repo: meetingConfig.properties.REPO?.replace(/"/g, ''),
    title,
    body: updatedContent,
    // Default assignee for Node.js meetings
    assignee: DEFAULT_CONFIG.assignee,
    // Add label if specified in config
    labels: issueLabel ? [issueLabel] : undefined,
  });

  return response.data;
};
