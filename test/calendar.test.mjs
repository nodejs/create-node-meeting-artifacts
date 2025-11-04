import assert from 'node:assert';
import { describe, it } from 'node:test';

import { findNextMeetingDate } from '../src/calendar.mjs';

describe('Calendar', () => {
  describe('findNextMeetingDate', () => {
    it('should return null when no matching events are found', async () => {
      const allEvents = [];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, null);
    });

    it('should return null when events exist but do not match the filter', async () => {
      const allEvents = [
        {
          summary: 'Different Meeting',
          rrule: {
            options: {},
            between: () => [new Date('2025-11-04T14:00:00Z')],
          },
          tzid: 'UTC',
        },
      ];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, null);
    });

    it('should return null when matching events exist but have no recurrences in the week', async () => {
      const allEvents = [
        {
          summary: 'Test Meeting',
          rrule: {
            options: {},
            between: () => [],
          },
          tzid: 'UTC',
        },
      ];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, null);
    });

    it('should return the meeting date when a matching event with recurrence is found', async () => {
      const expectedDate = new Date('2025-11-04T14:00:00Z');
      const allEvents = [
        {
          summary: 'Test Meeting',
          rrule: {
            options: {},
            between: () => [expectedDate],
          },
          tzid: 'UTC',
        },
      ];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, expectedDate);
    });

    it('should match events using the description field', async () => {
      const expectedDate = new Date('2025-11-04T14:00:00Z');
      const allEvents = [
        {
          description: 'This is a Test Meeting',
          rrule: {
            options: {},
            between: () => [expectedDate],
          },
          tzid: 'UTC',
        },
      ];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, expectedDate);
    });

    it('should return null when events do not have rrule', async () => {
      const allEvents = [
        {
          summary: 'Test Meeting',
          tzid: 'UTC',
        },
      ];
      const meetingConfig = {
        properties: {
          CALENDAR_FILTER: 'Test Meeting',
          GROUP_NAME: 'Test Group',
        },
      };

      const result = await findNextMeetingDate(allEvents, meetingConfig);

      assert.strictEqual(result, null);
    });
  });
});
