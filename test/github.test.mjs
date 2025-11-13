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

      assert.deepStrictEqual(Object.keys(result), [
        'nodejs/node',
        'nodejs/nodejs.org',
      ]);
      assert.strictEqual(result['nodejs/node'].length, 2);
      assert.strictEqual(result['nodejs/nodejs.org'].length, 1);
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

    it('should include issue label when provided', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
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

    it('should not include labels when ISSUE_LABEL is not provided', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig({ ISSUE_LABEL: undefined }),
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

    it('should use default org when USER is not provided', async () => {
      const { client, create } = createMockClient();

      await github.createGitHubIssue(
        client,
        createMeetingConfig({ USER: undefined }),
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
            q: 'is:open in:title repo:"nodejs/node" "Node.js Meeting 2025-01-15"',
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

    it('should use default org when USER not provided', async () => {
      const { client, request } = createMockClient();

      await github.findGitHubIssueByTitle(
        client,
        'Test',
        createMeetingConfig({ USER: undefined })
      );

      assert.deepStrictEqual(request(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            per_page: 1,
            q: 'is:open in:title repo:"nodejs/node" "Test"',
          },
        ],
      ]);
    });

    it('should search for open issues only', async () => {
      const { client, request } = createMockClient();

      await github.findGitHubIssueByTitle(
        client,
        'Test',
        createMeetingConfig()
      );

      assert.deepStrictEqual(request(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            per_page: 1,
            q: 'is:open in:title repo:"nodejs/node" "Test"',
          },
        ],
      ]);
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

    it('should use default org when USER not provided', async () => {
      const { client, update } = createMockClient();

      await github.updateGitHubIssue(
        client,
        1,
        'Content',
        createMeetingConfig({ USER: undefined })
      );

      assert.deepStrictEqual(update(), [
        [
          {
            body: 'Content',
            issue_number: 1,
            owner: 'nodejs',
            repo: 'node',
          },
        ],
      ]);
    });
  });

  describe('getAgendaIssues', () => {
    it('should search for issues with agenda label', async () => {
      const { client, paginate } = createMockClient();

      await github.getAgendaIssues(
        client,
        { meetingGroup: 'tsc' },
        createMeetingConfig({ AGENDA_TAG: 'some-agenda' })
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

    it('should use default org when USER not provided', async () => {
      const { client, paginate } = createMockClient();

      await github.getAgendaIssues(
        client,
        { meetingGroup: 'tsc' },
        createMeetingConfig({ USER: undefined, AGENDA_TAG: 'tsc-agenda' })
      );

      assert.deepStrictEqual(paginate(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            q: 'is:open label:tsc-agenda org:nodejs',
          },
        ],
      ]);
    });

    it('should construct default agenda tag from meetingGroup when not provided', async () => {
      const { client, paginate } = createMockClient();

      await github.getAgendaIssues(
        client,
        { meetingGroup: 'tsc' },
        createMeetingConfig({ AGENDA_TAG: undefined })
      );

      assert.deepStrictEqual(paginate(), [
        [
          'GET /search/issues',
          {
            advanced_search: true,
            q: 'is:open label:tsc-agenda org:nodejs',
          },
        ],
      ]);
    });

    it('should return sorted issues by repo', async () => {
      const { client } = createMockClient({
        paginate: [
          createIssue(1, 'nodejs/node'),
          createIssue(2, 'nodejs/nodejs.org'),
        ],
      });

      const result = await github.getAgendaIssues(
        client,
        { meetingGroup: 'tsc' },
        createMeetingConfig({ AGENDA_TAG: 'tsc-agenda' })
      );

      assert.ok(result['nodejs/node']);
      assert.ok(result['nodejs/nodejs.org']);
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

    it('should force update when force flag is true', async () => {
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
  });
});
