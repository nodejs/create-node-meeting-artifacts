import assert from 'node:assert';
import { describe, it } from 'node:test';

import {
  createIssue,
  createMeetingConfig,
  createMockClient,
} from './helpers.mjs';
import * as github from '../src/github.mjs';

describe('github.mjs', () => {
  describe('sortIssuesByRepo', () => {
    it('should group issues by repository', () => {
      const result = github.sortIssuesByRepo([
        createIssue(1, 'nodejs/node'),
        createIssue(2, 'nodejs/node'),
        createIssue(3, 'nodejs/nodejs.org'),
      ]);

      assert.deepStrictEqual(
        result.map(group => group.repo),
        ['nodejs/node', 'nodejs/nodejs.org']
      );
      assert.strictEqual(result[0].issues.length, 2);
      assert.strictEqual(result[1].issues.length, 1);
    });

    it('should return an empty array for no issues', () => {
      assert.deepStrictEqual(github.sortIssuesByRepo([]), []);
    });
  });

  describe('createGitHubIssue', () => {
    it('should call rest.issues.create with correct parameters', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig(),
        'Test Issue Title',
        'Test Issue Content'
      );

      assert.deepStrictEqual(create(), [
        [
          {
            body: 'Test Issue Content',
            labels: ['meeting'],
            owner: 'nodejs',
            repo: 'node',
            title: 'Test Issue Title',
          },
        ],
      ]);
    });

    it('should include issue labels when provided', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig({ github: { issueLabels: ['cpc-meeting'] } }),
        'Title',
        'Content'
      );

      assert.deepStrictEqual(create()[0][0].labels, ['cpc-meeting']);
    });

    it('should not include labels when issueLabels is not provided', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig({ github: { issueLabels: undefined } }),
        'Title',
        'Content'
      );

      assert.deepStrictEqual(create(), [
        [
          {
            body: 'Content',
            labels: undefined,
            owner: 'nodejs',
            repo: 'node',
            title: 'Title',
          },
        ],
      ]);
    });

    it('should use the configured owner and repo', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig({
          github: { owner: 'openjs-foundation', repo: 'standards' },
        }),
        'Title',
        'Content'
      );

      assert.strictEqual(create()[0][0].owner, 'openjs-foundation');
      assert.strictEqual(create()[0][0].repo, 'standards');
    });
  });

  describe('findGitHubIssueByTitle', () => {
    it('should search for issues with exact title match', async () => {
      const { client, request } = createMockClient();

      await github.findGitHubIssueByTitle(
        client,
        'Node.js Meeting 2025-01-15',
        createMeetingConfig()
      );

      assert.deepStrictEqual(request(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            per_page: 1,
            q: 'in:title repo:"nodejs/node" "Node.js Meeting 2025-01-15"',
          },
        ],
      ]);
    });

    it('should return first matching issue', async () => {
      const { client } = createMockClient({
        request: {
          items: [
            { number: 1, title: 'Issue 1' },
            { number: 2, title: 'Issue 2' },
          ],
        },
      });

      const result = await github.findGitHubIssueByTitle(
        client,
        'Test',
        createMeetingConfig()
      );

      assert.strictEqual(result.number, 1);
    });

    it('should return undefined when no issues found', async () => {
      const { client } = createMockClient();

      const result = await github.findGitHubIssueByTitle(
        client,
        'Nonexistent',
        createMeetingConfig()
      );

      assert.strictEqual(result, undefined);
    });

    it('should build the query from the configured owner and repo', async () => {
      const { client, request } = createMockClient();

      await github.findGitHubIssueByTitle(
        client,
        'Test',
        createMeetingConfig({
          github: { owner: 'openjs-foundation', repo: 'standards' },
        })
      );

      assert.strictEqual(
        request()[0][1].q,
        'in:title repo:"openjs-foundation/standards" "Test"'
      );
    });
  });

  describe('updateGitHubIssue', () => {
    it('should call issues.update with correct parameters', async () => {
      const { client, update } = createMockClient();

      await github.updateGitHubIssue(
        client,
        42,
        'New content',
        createMeetingConfig()
      );

      assert.deepStrictEqual(update(), [
        [
          {
            body: 'New content',
            issue_number: 42,
            owner: 'nodejs',
            repo: 'node',
          },
        ],
      ]);
    });

    it('should use the configured owner and repo', async () => {
      const { client, update } = createMockClient();

      await github.updateGitHubIssue(
        client,
        1,
        'Content',
        createMeetingConfig({
          github: { owner: 'openjs-foundation', repo: 'standards' },
        })
      );

      assert.deepStrictEqual(update(), [
        [
          {
            body: 'Content',
            issue_number: 1,
            owner: 'openjs-foundation',
            repo: 'standards',
          },
        ],
      ]);
    });
  });

  describe('getAgendaIssues', () => {
    it('should search for issues with the agenda label', async () => {
      const { client, paginate } = createMockClient();

      await github.getAgendaIssues(
        client,
        createMeetingConfig({ github: { agendaLabel: 'some-agenda' } })
      );

      assert.deepStrictEqual(paginate(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            q: 'is:open label:some-agenda org:nodejs',
          },
        ],
      ]);
    });

    it('should use the configured owner', async () => {
      const { client, paginate } = createMockClient();

      await github.getAgendaIssues(
        client,
        createMeetingConfig({
          github: {
            owner: 'openjs-foundation',
            agendaLabel: 'standards-agenda',
          },
        })
      );

      assert.deepStrictEqual(paginate(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            q: 'is:open label:standards-agenda org:openjs-foundation',
          },
        ],
      ]);
    });

    it('should return issues grouped by repo', async () => {
      const { client } = createMockClient({
        paginate: [
          createIssue(1, 'nodejs/node'),
          createIssue(2, 'nodejs/nodejs.org'),
        ],
      });

      const result = await github.getAgendaIssues(
        client,
        createMeetingConfig()
      );

      assert.deepStrictEqual(
        result.map(group => group.repo),
        ['nodejs/node', 'nodejs/nodejs.org']
      );
    });
  });

  describe('createOrUpdateGitHubIssue', () => {
    it('should create new issue when no existing issue found', async () => {
      const { client, create } = createMockClient();

      await github.createOrUpdateGitHubIssue(
        client,
        { force: true },
        createMeetingConfig(),
        'Title',
        'Content'
      );

      assert.deepStrictEqual(create(), [
        [
          {
            body: 'Content',
            labels: ['meeting'],
            owner: 'nodejs',
            repo: 'node',
            title: 'Title',
          },
        ],
      ]);
    });

    it('should update existing issue when content differs', async () => {
      const existingIssue = {
        number: 1,
        title: 'Existing Issue',
        body: 'Old content',
      };
      const { client, update } = createMockClient({
        request: { items: [existingIssue] },
      });

      await github.createOrUpdateGitHubIssue(
        client,
        { force: false },
        createMeetingConfig(),
        'Existing Issue',
        'New content'
      );

      assert.deepStrictEqual(update(), [
        [
          {
            body: 'New content',
            issue_number: 1,
            owner: 'nodejs',
            repo: 'node',
          },
        ],
      ]);
    });

    it('should not update existing issue when content is same', async () => {
      const existingIssue = {
        number: 1,
        title: 'Existing Issue',
        body: 'Same content',
      };
      const { client, update } = createMockClient({
        request: { items: [existingIssue] },
      });

      await github.createOrUpdateGitHubIssue(
        client,
        { force: false },
        createMeetingConfig(),
        'Existing Issue',
        'Same content'
      );

      assert.deepStrictEqual(update(), []);
    });

    it('should create a new issue when forced', async () => {
      const existingIssue = {
        number: 1,
        title: 'Existing Issue',
        body: 'Same content',
      };
      const { client, create } = createMockClient({
        request: { items: [existingIssue] },
      });

      await github.createOrUpdateGitHubIssue(
        client,
        { force: true },
        createMeetingConfig(),
        'Existing Issue',
        'Same content'
      );

      assert.strictEqual(create().length, 1);
    });
  });
});
