import assert from 'node:assert';
import { describe, it } from 'node:test';

import { DEFAULT_CONFIG } from '../src/constants.mjs';
import * as meeting from '../src/meeting.mjs';

describe('meeting.mjs', () => {
  describe('generateMeetingTitle', () => {
    const titleTestCases = [
      {
        name: 'should generate title with host and group name',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: { HOST: 'Node.js', GROUP_NAME: 'TSC' } },
        date: new Date('2025-01-15T10:30:00Z'),
        expectations: ['Node.js', 'TSC', '2025-01-15'],
      },
      {
        name: 'should use default host when HOST not provided',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: { GROUP_NAME: 'TSC' } },
        date: new Date('2025-01-15T10:30:00Z'),
        expectations: [DEFAULT_CONFIG.host, 'TSC'],
      },
      {
        name: 'should use meetingGroup as GROUP_NAME when GROUP_NAME not provided',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: { HOST: 'Node.js' } },
        date: new Date('2025-01-15T10:30:00Z'),
        expectations: ['tsc'],
      },
      {
        name: 'should format date as YYYY-MM-DD',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: {} },
        date: new Date('2025-06-15T10:30:00Z'),
        expectations: ['2025-06-15'],
      },
      {
        name: 'should include "Meeting" text in title',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: {} },
        date: new Date('2025-01-15T10:30:00Z'),
        expectations: ['Meeting'],
      },
    ];

    titleTestCases.forEach(
      ({ name, config, meetingConfig, date, expectations }) => {
        it(name, () => {
          const result = meeting.generateMeetingTitle(
            config,
            meetingConfig,
            date
          );
          expectations.forEach(expectation => {
            assert(
              result.includes(expectation),
              `Expected "${expectation}" in "${result}"`
            );
          });
        });
      }
    );

    it('should generate consistent title for same inputs', () => {
      const config = { meetingGroup: 'tsc' };
      const meetingConfig = {
        properties: { HOST: 'Node.js', GROUP_NAME: 'TSC' },
      };
      const date = new Date('2025-01-15T10:30:00Z');

      const result1 = meeting.generateMeetingTitle(config, meetingConfig, date);
      const result2 = meeting.generateMeetingTitle(config, meetingConfig, date);

      assert.strictEqual(result1, result2);
    });

    const edgeCases = [
      {
        name: 'should handle very long group names',
        config: { meetingGroup: 'x'.repeat(100) },
        meetingConfig: {
          properties: { HOST: 'Node.js', GROUP_NAME: 'y'.repeat(100) },
        },
        date: new Date('2025-01-15T10:30:00Z'),
        check: result => result.includes('y'.repeat(100)),
      },
      {
        name: 'should handle special characters in group names',
        config: { meetingGroup: 'tsc' },
        meetingConfig: {
          properties: { HOST: 'Node.js', GROUP_NAME: 'TSC & CTC (merged)' },
        },
        date: new Date('2025-01-15T10:30:00Z'),
        check: result => result.includes('TSC & CTC (merged)'),
      },
      {
        name: 'should handle dates at month boundaries',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: {} },
        date: new Date('2025-01-31T23:59:59Z'),
        check: result => result.includes('2025-01-31'),
      },
      {
        name: 'should handle leap year dates',
        config: { meetingGroup: 'tsc' },
        meetingConfig: { properties: {} },
        date: new Date('2024-02-29T10:30:00Z'),
        check: result => result.includes('2024-02-29'),
      },
    ];

    edgeCases.forEach(({ name, config, meetingConfig, date, check }) => {
      it(name, () => {
        const result = meeting.generateMeetingTitle(
          config,
          meetingConfig,
          date
        );
        assert(check(result), `Check failed for "${name}"`);
      });
    });
  });

  describe('generateMeetingAgenda', () => {
    const agendaTestCases = [
      {
        name: 'should format single repo with issues',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue 1',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
            {
              number: 2,
              title: 'Issue 2',
              html_url: 'https://github.com/nodejs/node/issues/2',
            },
          ],
        },
        checks: ['nodejs/node', 'Issue 1', 'Issue 2', '#1', '#2'],
      },
      {
        name: 'should format multiple repos with issues',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue 1',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
          'nodejs/nodejs.org': [
            {
              number: 2,
              title: 'Issue 2',
              html_url: 'https://github.com/nodejs/nodejs.org/issues/2',
            },
          ],
        },
        checks: ['nodejs/node', 'nodejs/nodejs.org', 'Issue 1', 'Issue 2'],
      },
      {
        name: 'should skip repos with no issues',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue 1',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
          'nodejs/empty': [],
        },
        checks: ['nodejs/node'],
        excludes: ['nodejs/empty'],
      },
      {
        name: 'should escape markdown special characters in issue titles',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue with [brackets] and stuff',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
        },
        checks: ['\\[brackets\\]'],
      },
      {
        name: 'should format as markdown list',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue 1',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
        },
        checks: ['* ', '### nodejs/node'],
      },
      {
        name: 'should include issue links',
        input: {
          'nodejs/node': [
            {
              number: 1,
              title: 'Issue 1',
              html_url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
        },
        checks: ['[#1]', '(https://github.com/nodejs/node/issues/1)'],
      },
      {
        name: 'should handle empty agenda',
        input: {},
        isEmpty: true,
      },
      {
        name: 'should handle multiple issues in one repo',
        input: {
          'nodejs/node': [
            { number: 1, title: 'First', html_url: 'https://example.com/1' },
            { number: 2, title: 'Second', html_url: 'https://example.com/2' },
            { number: 3, title: 'Third', html_url: 'https://example.com/3' },
          ],
        },
        lineCountMin: 4,
      },
      {
        name: 'should preserve issue title exactly',
        input: {
          'nodejs/node': [
            {
              number: 123,
              title: 'Add feature X to Node.js',
              html_url: 'https://github.com/nodejs/node/issues/123',
            },
          ],
        },
        checks: ['Add feature X to Node.js'],
      },
      {
        name: 'should list issues in order',
        input: {
          'nodejs/node': [
            { number: 1, title: 'First', html_url: 'https://example.com/1' },
            { number: 2, title: 'Second', html_url: 'https://example.com/2' },
            { number: 3, title: 'Third', html_url: 'https://example.com/3' },
          ],
        },
        checkOrder: ['First', 'Second', 'Third'],
      },
    ];

    agendaTestCases.forEach(
      ({
        name,
        input,
        checks = [],
        excludes = [],
        isEmpty,
        lineCountMin,
        checkOrder,
      }) => {
        it(name, () => {
          const result = meeting.generateMeetingAgenda(input);

          if (isEmpty) {
            assert.strictEqual(result.trim(), '');
          }

          checks.forEach(check => {
            assert(result.includes(check), `Expected "${check}" in result`);
          });

          excludes.forEach(exclude => {
            assert(
              !result.includes(exclude),
              `Did not expect "${exclude}" in result`
            );
          });

          if (lineCountMin) {
            const lines = result.split('\n');
            assert(
              lines.length >= lineCountMin,
              `Expected at least ${lineCountMin} lines, got ${lines.length}`
            );
          }

          if (checkOrder) {
            let lastIndex = -1;
            checkOrder.forEach(item => {
              const index = result.indexOf(item);
              assert(
                index > lastIndex,
                `Expected "${item}" to appear after previous items`
              );
              lastIndex = index;
            });
          }
        });
      }
    );

    it('should trim whitespace from result', () => {
      const agendaIssues = {
        'nodejs/node': [
          { number: 1, title: 'Issue', html_url: 'https://example.com/1' },
        ],
      };

      const result = meeting.generateMeetingAgenda(agendaIssues);

      assert.strictEqual(result, result.trim());
    });
  });
});
