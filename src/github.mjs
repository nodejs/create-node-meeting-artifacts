import { Octokit } from '@octokit/rest';

/**
 * Creates a GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - Application configuration
 * @returns {import('@octokit/rest').Octokit} Configured GitHub API client
 */
export const createGitHubClient = ({ githubToken: auth, verbose }) =>
  new Octokit({ auth, log: verbose ? console : undefined });

/**
 * Creates a GitHub issue with meeting information
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @returns {Promise<import('./types.d.ts').GitHubIssue>} Created issue data
 */
export const createGitHubIssue = async ({ rest }, meeting, title, content) => {
  const { owner, repo, issueLabels } = meeting.github;

  // Create the GitHub issue with meeting information
  const response = await rest.issues.create({
    owner,
    repo,
    title,
    body: content,
    labels: issueLabels,
  });

  return response.data;
};

/**
 * Creates or updates a GitHub issue with meeting information
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').AppConfig} config - The application config
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration object
 * @param {string} title - Issue title
 * @param {string} content - Issue content
 * @returns {Promise<import('./types.d.ts').GitHubIssue>} Created issue data
 */
export const createOrUpdateGitHubIssue = async (
  githubClient,
  { force },
  meeting,
  title,
  content
) => {
  if (!force) {
    const existingIssue = await findGitHubIssueByTitle(
      githubClient,
      title,
      meeting
    );

    if (existingIssue) {
      if (content !== existingIssue.body) {
        await updateGitHubIssue(
          githubClient,
          existingIssue.number,
          content,
          meeting
        );
      }

      return existingIssue;
    }
  }

  return createGitHubIssue(githubClient, meeting, title, content);
};

/**
 * Groups issues by their repository
 * @param {Array<import('./types.d.ts').GitHubIssue>} issues The issues to group
 * @returns {Array<import('./types.d.ts').AgendaGroup>} Issues grouped by repository
 */
export const sortIssuesByRepo = issues => {
  const byRepo = new Map();

  for (const issue of issues) {
    const repo = issue.repository_url.split('/').slice(-2).join('/');

    if (!byRepo.has(repo)) {
      byRepo.set(repo, []);
    }

    byRepo.get(repo).push(issue);
  }

  return [...byRepo].map(([repo, repoIssues]) => ({
    repo,
    issues: repoIssues,
  }));
};

/**
 * Updates an existing GitHub issue with new content
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {number} number - The issue number
 * @param {string} content - The new content
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 */
export const updateGitHubIssue = async ({ rest }, number, content, meeting) => {
  const { owner, repo } = meeting.github;

  return rest.issues.update({
    issue_number: number,
    body: content,
    owner,
    repo,
  });
};

/**
 * Fetches a GitHub issue from a repo with a given title
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {string} title - The title to find
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 */
export const findGitHubIssueByTitle = async (githubClient, title, meeting) => {
  const { owner, repo } = meeting.github;

  const issues = await githubClient.request('GET /search/issues', {
    q: `in:title repo:"${owner}/${repo}" "${title}"`,
    advanced_search: true,
    per_page: 1,
  });

  return issues.data.items[0];
};

/**
 * Fetches GitHub issues from all repositories in an organization with the agenda label
 * @param {import('@octokit/rest').Octokit} githubClient - Authenticated GitHub API client
 * @param {import('./types.d.ts').MeetingConfig} meeting - Meeting configuration
 * @returns {Promise<Array<import('./types.d.ts').AgendaGroup>>} Agenda issues grouped by repository
 */
export const getAgendaIssues = async (githubClient, meeting) => {
  const { owner, agendaLabel } = meeting.github;

  // Get all issues/PRs in the organization
  const issues = await githubClient.paginate('GET /search/issues', {
    q: `is:open label:${agendaLabel} org:${owner}`,
    advanced_search: true,
  });

  return sortIssuesByRepo(issues);
};
