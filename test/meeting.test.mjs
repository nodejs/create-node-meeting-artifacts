import assert from 'node:assert';
import { readdir, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { createMeetingConfig, createIssue } from './helpers.mjs';
import { DEFAULT_HOST } from '../src/constants.mjs';
import * as meeting from '../src/meeting.mjs';

const MEETINGS_DIR = new URL('../meetings/', import.meta.url);

const groupNames = (await readdir(MEETINGS_DIR))
  .filter(name => name.endsWith('.meeting.json'))
  .map(name => name.replace(/\.meeting\.json$/, ''));

describe('meeting.mjs', () => {
  describe('load', () => {
    it('should load a known config and attach its group', async () => {
      const tsc = await meeting.load('tsc');

      assert.strictEqual(tsc.group, 'tsc');
      assert.strictEqual(tsc.name, 'Technical Steering Committee (TSC)');
      assert.strictEqual(tsc.github.owner, 'nodejs');
      assert.strictEqual(tsc.github.repo, 'TSC');
    });

    it('should default the agenda label to <group>-agenda', async () => {
      const tsc = await meeting.load('tsc');
      assert.strictEqual(tsc.github.agendaLabel, 'tsc-agenda');
    });

    it('should preserve an explicit agenda label', async () => {
      const build = await meeting.load('build');
      assert.strictEqual(build.github.agendaLabel, 'build-agenda');

      const web = await meeting.load('web');
      assert.strictEqual(web.github.agendaLabel, 'web-agenda');
    });

    it('should default the host to Node.js', async () => {
      const build = await meeting.load('build');
      assert.strictEqual(build.host, DEFAULT_HOST);
    });

    it('should preserve a non-default host', async () => {
      const standards = await meeting.load('standards');
      assert.strictEqual(standards.host, 'OpenJS Foundation');
    });

    it('should always expose observers and agenda arrays', async () => {
      const tsc = await meeting.load('tsc');
      assert.ok(Array.isArray(tsc.observers));
      assert.ok(Array.isArray(tsc.agenda));
    });
  });

  describe('every meeting config', () => {
    it('should exist', () => {
      assert.ok(groupNames.length > 0, 'expected at least one meeting config');
    });

    groupNames.forEach(group => {
      it(`${group} should follow the identical, valid format`, async () => {
        const config = await meeting.load(group);

        assert.strictEqual(typeof config.name, 'string');
        assert.ok(config.name.length > 0);
        assert.strictEqual(typeof config.host, 'string');

        assert.strictEqual(typeof config.calendar.filter, 'string');
        assert.match(config.calendar.url, /^https?:\/\//);

        assert.strictEqual(typeof config.github.owner, 'string');
        assert.strictEqual(typeof config.github.repo, 'string');
        assert.strictEqual(typeof config.github.agendaLabel, 'string');

        assert.strictEqual(typeof config.hackmd.team, 'string');

        assert.ok(Array.isArray(config.invited));
        assert.ok(config.invited.length > 0);
        assert.ok(Array.isArray(config.observers));
        assert.ok(Array.isArray(config.agenda));
      });
    });

    it('should be valid JSON', async () => {
      for (const group of groupNames) {
        const raw = await readFile(meeting.configURL(group), 'utf8');
        assert.doesNotThrow(
          () => JSON.parse(raw),
          `${group} should be valid JSON`
        );
      }
    });
  });

  describe('generateMeetingTitle', () => {
    const date = new Date('2025-01-15T10:30:00Z');

    it('should combine host, name and date', () => {
      const title = meeting.generateMeetingTitle(
        createMeetingConfig({ host: 'Node.js', name: 'TSC' }),
        date
      );
      assert.strictEqual(title, 'Node.js TSC Meeting 2025-01-15');
    });

    it('should fall back to the group when name is missing', () => {
      const title = meeting.generateMeetingTitle(
        createMeetingConfig({ name: undefined, group: 'tsc' }),
        date
      );
      assert.ok(title.includes('tsc'));
    });

    it('should fall back to the default host when host is missing', () => {
      const title = meeting.generateMeetingTitle(
        createMeetingConfig({ host: undefined, name: 'TSC' }),
        date
      );
      assert.ok(title.startsWith(DEFAULT_HOST));
    });

    it('should format the date as YYYY-MM-DD', () => {
      const title = meeting.generateMeetingTitle(
        createMeetingConfig(),
        new Date('2025-06-15T23:59:59Z')
      );
      assert.ok(title.includes('2025-06-15'));
    });
  });

  describe('createTemplateContext', () => {
    const date = new Date('2025-01-15T10:30:00Z');

    it('should expose timezone and link data', () => {
      const ctx = meeting.createTemplateContext(
        createMeetingConfig(),
        date,
        [],
        []
      );

      assert.ok(ctx.utc.length > 0);
      assert.strictEqual(ctx.timezones.length, 12);
      assert.ok(ctx.timeAndDateLink.startsWith('https://'));
      assert.ok(ctx.wolframLink.startsWith('https://'));
      assert.strictEqual(ctx.isMinutes, false);
    });

    it('should surface the agenda label and owner', () => {
      const ctx = meeting.createTemplateContext(
        createMeetingConfig({ github: { agendaLabel: 'tsc-agenda' } }),
        date,
        [],
        []
      );

      assert.strictEqual(ctx.agendaLabel, 'tsc-agenda');
      assert.strictEqual(ctx.owner, 'nodejs');
    });

    it('should flag whether agenda issues are present', () => {
      const empty = meeting.createTemplateContext(
        createMeetingConfig(),
        date,
        [],
        []
      );
      assert.strictEqual(empty.hasAgenda, false);

      const withIssues = meeting.createTemplateContext(
        createMeetingConfig(),
        date,
        [{ repo: 'nodejs/node', issues: [createIssue(1, 'nodejs/node')] }],
        []
      );
      assert.strictEqual(withIssues.hasAgenda, true);
    });

    it('should escape markdown brackets in issue titles', () => {
      const ctx = meeting.createTemplateContext(
        createMeetingConfig(),
        date,
        [
          {
            repo: 'nodejs/node',
            issues: [
              {
                number: 1,
                title: 'Issue with [brackets]',
                html_url: 'https://github.com/nodejs/node/issues/1',
              },
            ],
          },
        ],
        []
      );

      assert.strictEqual(
        ctx.agenda[0].issues[0].title,
        'Issue with \\[brackets\\]'
      );
    });

    it('should pass isMinutes and title through', () => {
      const ctx = meeting.createTemplateContext(
        createMeetingConfig(),
        date,
        [],
        [],
        { isMinutes: true, title: 'Node.js TSC Meeting 2025-01-15' }
      );
      assert.strictEqual(ctx.isMinutes, true);
      assert.strictEqual(ctx.title, 'Node.js TSC Meeting 2025-01-15');
    });

    it('should default the calendar page from the host', () => {
      const node = meeting.createTemplateContext(
        createMeetingConfig({ host: 'Node.js' }),
        date,
        [],
        []
      );
      assert.strictEqual(node.calendarPage, 'https://nodejs.org/calendar');

      const openjs = meeting.createTemplateContext(
        createMeetingConfig({ host: 'OpenJS Foundation' }),
        date,
        [],
        []
      );
      assert.strictEqual(openjs.calendarPage, 'https://calendar.openjsf.org');
    });

    it('should allow the calendar page to be overridden', () => {
      const ctx = meeting.createTemplateContext(
        createMeetingConfig({ calendar: { page: 'https://example.com/cal' } }),
        date,
        [],
        []
      );
      assert.strictEqual(ctx.calendarPage, 'https://example.com/cal');
    });
  });

  describe('resolveJoining', () => {
    const sessions = [
      { time: '13:00', participant: 'https://zoom/13' },
      { time: '17:00', participant: 'https://zoom/17' },
    ];

    it('should return the single participant when there are no sessions', () => {
      const result = meeting.resolveJoining(
        createMeetingConfig({ joining: { participant: 'https://zoom/1' } }),
        new Date('2025-01-15T10:30:00Z')
      );
      assert.strictEqual(result.participant, 'https://zoom/1');
      assert.strictEqual(result.sessions, undefined);
    });

    it('should select the session matching the occurrence UTC time', () => {
      const config = createMeetingConfig({ joining: { sessions } });

      const at13 = meeting.resolveJoining(
        config,
        new Date('2026-06-24T13:00:00Z')
      );
      assert.strictEqual(at13.participant, 'https://zoom/13');
      assert.strictEqual(at13.sessions, undefined);

      const at17 = meeting.resolveJoining(
        config,
        new Date('2026-07-01T17:00:00Z')
      );
      assert.strictEqual(at17.participant, 'https://zoom/17');
    });

    it('should list all sessions when none matches (e.g. dry-run)', () => {
      const result = meeting.resolveJoining(
        createMeetingConfig({ joining: { sessions } }),
        new Date('2026-06-24T09:00:00Z')
      );
      assert.strictEqual(result.participant, undefined);
      assert.deepStrictEqual(result.sessions, sessions);
    });
  });

  describe('render', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    const agenda = [
      {
        repo: 'nodejs/node',
        issues: [
          {
            number: 42,
            title: 'Discuss [streams]',
            html_url: 'https://github.com/nodejs/node/issues/42',
          },
        ],
      },
    ];

    it('should render an issue with invited, agenda and joining sections', async () => {
      const config = createMeetingConfig({
        name: 'TSC',
        invited: ['@nodejs/tsc'],
        joining: {
          participant: 'https://zoom.us/j/1',
          observer: 'https://youtube.com/live',
        },
      });

      const output = await meeting.render(
        meeting.createTemplateContext(config, date, agenda, [
          { title: 'Minutes', url: 'https://hackmd.io/abc' },
        ])
      );

      assert.ok(output.includes('## Time'));
      assert.ok(output.includes('## Invited'));
      assert.ok(output.includes('@nodejs/tsc'));
      assert.ok(output.includes('Minutes: <https://hackmd.io/abc>'));
      assert.ok(output.includes('### Issues and Pull Requests'));
      assert.ok(output.includes('**node-agenda**'));
      assert.ok(output.includes('#### nodejs/node'));
      assert.ok(output.includes('Discuss \\[streams\\] [#42]'));
      assert.ok(output.includes('## Joining the meeting'));
      assert.ok(output.includes('To join the meeting: https://zoom.us/j/1'));
      assert.ok(!output.includes('## Q&A, Other'));
      assert.ok(!output.includes('**Recording**'));
    });

    it('should render the matching session link for an alternating meeting', async () => {
      const config = createMeetingConfig({
        name: 'TSC',
        joining: {
          observer: 'https://youtube.com/live',
          sessions: [
            { time: '13:00', participant: 'https://zoom/13' },
            { time: '17:00', participant: 'https://zoom/17' },
          ],
        },
      });

      const output = await meeting.render(
        meeting.createTemplateContext(
          config,
          new Date('2026-06-24T13:00:00Z'),
          [],
          [{ title: 'Minutes', url: 'https://hackmd.io/abc' }]
        )
      );

      assert.ok(output.includes('To join the meeting: https://zoom/13'));
      assert.ok(!output.includes('https://zoom/17'));
    });

    it('should list all session links when none matches (dry-run)', async () => {
      const config = createMeetingConfig({
        name: 'TSC',
        joining: {
          sessions: [
            { time: '13:00', participant: 'https://zoom/13' },
            { time: '17:00', participant: 'https://zoom/17' },
          ],
        },
      });

      const output = await meeting.render(
        meeting.createTemplateContext(
          config,
          new Date('2026-06-24T09:00:00Z'),
          [],
          [{ title: 'Minutes', url: 'https://hackmd.io/abc' }]
        )
      );

      assert.ok(
        output.includes('To join the 13:00 UTC meeting: https://zoom/13')
      );
      assert.ok(
        output.includes('To join the 17:00 UTC meeting: https://zoom/17')
      );
    });

    it('should render minutes with Present and Q&A sections', async () => {
      const config = createMeetingConfig({ name: 'TSC' });

      const output = await meeting.render(
        meeting.createTemplateContext(
          config,
          date,
          agenda,
          [
            { title: 'Minutes', url: 'https://hackmd.io/abc' },
            {
              title: 'GitHub Issue',
              url: 'https://github.com/nodejs/node/issues/1',
            },
          ],
          { isMinutes: true, title: 'Node.js TSC Meeting 2025-01-15' }
        )
      );

      assert.ok(output.startsWith('# Node.js TSC Meeting 2025-01-15'));
      assert.ok(output.includes('* **Recording**:'));
      assert.ok(output.includes('## Present'));
      assert.ok(output.includes('### Announcements'));
      assert.ok(output.includes('## Q&A, Other'));
      assert.ok(output.includes('## Upcoming Meetings'));
      assert.ok(!output.includes('## Joining the meeting'));
    });

    it('should render curated agenda sections only in the minutes', async () => {
      const config = createMeetingConfig({
        name: 'CPC',
        host: 'OpenJS Foundation',
        agenda: [
          {
            title: 'Working Group Updates',
            description: 'Standing review of the collab spaces:',
            items: [
              '[security](https://github.com/openjs-foundation/security-collab-space)',
            ],
          },
        ],
      });

      const minutes = await meeting.render(
        meeting.createTemplateContext(config, date, [], [], {
          isMinutes: true,
          title: 'OpenJS CPC Meeting 2025-01-15',
        })
      );
      assert.ok(minutes.includes('### Working Group Updates'));
      assert.ok(minutes.includes('Standing review of the collab spaces:'));
      assert.ok(
        minutes.includes(
          '[security](https://github.com/openjs-foundation/security-collab-space)'
        )
      );
      // OpenJS host uses the OpenJS public calendar.
      assert.ok(minutes.includes('<https://calendar.openjsf.org>'));

      const issue = await meeting.render(
        meeting.createTemplateContext(config, date, [], [])
      );
      assert.ok(!issue.includes('### Working Group Updates'));
    });

    it('should show a fallback when there are no agenda items', async () => {
      const output = await meeting.render(
        meeting.createTemplateContext(createMeetingConfig(), date, [], [])
      );

      assert.ok(output.includes('_No agenda items found._'));
    });

    it('should render every real meeting config without throwing', async () => {
      for (const group of groupNames) {
        const config = await meeting.load(group);
        const output = await meeting.render(
          meeting.createTemplateContext(
            config,
            date,
            [],
            [{ title: 'Minutes', url: 'https://hackmd.io/x' }]
          )
        );
        assert.ok(
          output.includes('## Time'),
          `${group} should render a header`
        );
        assert.ok(
          output.includes('## Invited'),
          `${group} should render invited`
        );
        assert.ok(
          output.includes(`**${config.github.agendaLabel}**`),
          `${group} should reference its agenda label`
        );
      }
    });
  });
});
