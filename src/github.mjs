import { Octokit } from '@octokit/rest';

/**
 * Creates GitHub issue with meeting information and Google Doc link
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @returns {Promise<GitHubIssue>} Created issue data
 */
export const createGitHubIssue = async (
  config,
  meetingConfig,
  title,
  content
) => {
  // Initialize GitHub API client with authentication token
  const octokit = new Octokit({ auth: config.githubToken });

  // Extract issue label from config, removing quotes if present
  const issueLabel = meetingConfig.properties.ISSUE_LABEL;

  // Create the GitHub issue with meeting information
  const response = await octokit.rest.issues.create({
    // Repository information from meeting config
    owner: meetingConfig.properties.USER,
    repo: meetingConfig.properties.REPO,
    title,
    body: content,
    // Add label if specified in config
    labels: issueLabel ? [issueLabel] : undefined,
  });

  return response.data;
};

/**
 * Fetches GitHub issues from all repositories in an organization with a specific label
 * @param {string} token - GitHub personal access token
 * @param {string} org - GitHub organization name (e.g., 'nodejs')
 * @param {string} label - Label to filter by (e.g., 'tsc-agenda')
 * @returns {Promise<string>} Formatted markdown string of issues
 */
export const fetchAgendaIssues = async (token, org, label) => {
  const octokit = new Octokit({ auth: token });

  // Get all public repositories in the organization
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org,
    type: 'public',
    per_page: 100,
  });

  // Fetch issues from all repositories concurrently
  const issuePromises = repos.map(async repo => {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner: org,
      repo: repo.name,
      labels: label,
      state: 'open',
      per_page: 100,
    });

    const filteredIssues = issues.filter(issue => !issue.pull_request); // Exclude PRs

    return { repoName: repo.name, issues: filteredIssues };
  });

  const repoIssues = await Promise.all(issuePromises);

  // Format issues as markdown
  let agendaMarkdown = '';

  repoIssues.forEach(({ repoName, issues }) => {
    if (issues.length > 0) {
      agendaMarkdown += `### ${org}/${repoName}\n\n`;

      issues.forEach(issue => {
        // Escape markdown characters in title
        const cleanTitle = issue.title.replace(/([[\]])/g, '\\$1');

        agendaMarkdown += `* ${cleanTitle} [#${issue.number}](${issue.html_url})\n`;
      });

      agendaMarkdown += '\n';
    }
  });

  return agendaMarkdown.trim();
};
