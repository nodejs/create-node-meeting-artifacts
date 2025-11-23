import { mock } from 'node:test';

export const createMockEvent = overrides => ({
  rrule: { options: {}, between: () => [] },
  ...overrides,
});

const createCallGetter =
  ({ mock }) =>
  () =>
    mock.calls.map(c => c.arguments);

export const createMockClient = (overrides = {}) => {
  const create = mock.fn(
    () => {},
    () => ({
      data: overrides.create ?? {
        number: 1,
        title: 'Test Issue',
        body: 'Test content',
        html_url: 'https://github.com/nodejs/node/issues/1',
      },
    })
  );

  const update = mock.fn(
    () => {},
    () => ({
      data: overrides.update ?? { number: 1, body: 'Updated content' },
    })
  );

  const request = mock.fn(
    () => {},
    () => ({ data: overrides.request ?? { items: [] } })
  );

  const paginate = mock.fn(
    () => {},
    () => overrides.paginate ?? []
  );

  return {
    create: createCallGetter(create),
    request: createCallGetter(request),
    update: createCallGetter(update),
    paginate: createCallGetter(paginate),
    client: {
      request,
      paginate,
      rest: {
        issues: {
          create,
          update,
        },
      },
    },
  };
};

export const createMeetingConfig = (overrides = {}) => ({
  properties: {
    USER: 'nodejs',
    REPO: 'node',
    ISSUE_LABEL: 'meeting',
    CALENDAR_FILTER: 'Node.js',
    ...overrides,
  },
});

export const createIssue = (number, repoPath) => ({
  number,
  title: `Issue ${number}`,
  repository_url: `https://api.github.com/repos/${repoPath}`,
});
