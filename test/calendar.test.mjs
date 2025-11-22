import assert from 'node:assert';
import { describe, it } from 'node:test';

import { createMeetingConfig, createMockEvent } from './helpers.mjs';
import * as calendar from '../src/calendar.mjs';

describe('calendar.mjs', () => {
  describe('getWeekBounds', () => {
    it('should return a week starting from the given date at UTC midnight', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const [start] = calendar.getWeekBounds(testDate);

      assert.strictEqual(start.getTime(), 1736899200000);
    });

    it('should return a week end 7 days after the start', () => {
      const testDate = new Date('2025-01-15T00:00:00Z');
      const [start, end] = calendar.getWeekBounds(testDate);
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);

      assert.strictEqual(diffDays, 7);
    });

    it('should use current date when no date is provided', () => {
      const [start, end] = calendar.getWeekBounds();

      assert(start <= new Date());
      assert(end >= new Date());
    });

    it('should handle dates across year boundaries', () => {
      const testDate = new Date('2024-12-30T00:00:00Z');
      const [start, weekEnd] = calendar.getWeekBounds(testDate);

      assert.strictEqual(start.getUTCFullYear(), 2024);
      assert.strictEqual(weekEnd.getUTCFullYear(), 2025);
    });

    it('should handle leap year dates', () => {
      const testDate = new Date('2024-02-28T00:00:00Z');
      const [start, end] = calendar.getWeekBounds(testDate);

      assert(start < end);
      assert.strictEqual((end - start) / (1000 * 60 * 60 * 24), 7);
    });

    it('should maintain UTC timezone context', () => {
      const testDate = new Date('2025-01-15T23:59:59Z');
      const [start] = calendar.getWeekBounds(testDate);

      assert.strictEqual(start.getUTCHours(), 0);
      assert.strictEqual(start.getUTCMinutes(), 0);
    });
  });

  describe('findNextMeetingDate', () => {
    it('should return null when no events match the filter', async () => {
      const result = await calendar.findNextMeetingDate(
        [],
        createMeetingConfig()
      );
      assert.strictEqual(result, null);
    });

    it('should return null when events do not have recurring rules', async () => {
      const events = [
        {
          summary: 'Node.js Meeting',
          rrule: null,
        },
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig()
      );
      assert.strictEqual(result, null);
    });

    it('should return null when filter does not match event summary or description', async () => {
      const events = [
        createMockEvent({
          summary: 'Other Meeting',
          description: 'Not related',
        }),
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig()
      );
      assert.strictEqual(result, null);
    });

    it('should find a matching recurring event with the correct filter', async () => {
      const mockDate = new Date('2025-01-15T10:00:00Z');
      const events = [
        createMockEvent({
          summary: 'Node.js TSC Meeting',
          rrule: { options: { tzid: 'UTC' }, between: () => [mockDate] },
        }),
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig()
      );
      assert.strictEqual(result, mockDate);
    });

    it('should match filter in description when summary is empty', async () => {
      const mockDate = new Date('2025-01-15T10:00:00Z');
      const events = [
        createMockEvent({
          description: 'Node.js Triage Meeting',
          rrule: { options: { tzid: 'UTC' }, between: () => [mockDate] },
        }),
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig({ CALENDAR_FILTER: 'Triage' })
      );
      assert.strictEqual(result, mockDate);
    });

    it('should return first occurrence when multiple events match', async () => {
      const date1 = new Date('2025-01-15T10:00:00Z');
      const date2 = new Date('2025-01-22T10:00:00Z');
      const events = [
        createMockEvent({
          summary: 'Node.js Meeting 1',
          rrule: { options: { tzid: 'UTC' }, between: () => [date1, date2] },
        }),
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig({ CALENDAR_FILTER: 'Meeting' })
      );
      assert.strictEqual(result, date1);
    });

    it('should set rrule timezone from event start timezone', async () => {
      const mockDate = new Date('2025-01-15T10:00:00Z');
      const tzidSetter = {};
      const events = [
        createMockEvent({
          summary: 'Node.js Meeting',
          start: { tz: 'America/New_York' },
          rrule: { options: tzidSetter, between: () => [mockDate] },
        }),
      ];
      await calendar.findNextMeetingDate(events, createMeetingConfig());
      assert.strictEqual(tzidSetter.tzid, 'America/New_York');
    });

    it('should handle multiple events and return first matching', async () => {
      const matchedDate = new Date('2025-01-15T10:00:00Z');
      const events = [
        createMockEvent({ summary: 'Other Event' }),
        createMockEvent({
          summary: 'Node.js Meeting',
          rrule: { options: {}, between: () => [matchedDate] },
        }),
      ];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig()
      );
      assert.strictEqual(result, matchedDate);
    });

    it('should handle events without rrule property', async () => {
      const events = [{ summary: 'Node.js Meeting' }];
      const result = await calendar.findNextMeetingDate(
        events,
        createMeetingConfig()
      );
      assert.strictEqual(result, null);
    });
  });
});
