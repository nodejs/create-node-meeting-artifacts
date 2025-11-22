import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as dates from '../../src/utils/dates.mjs';

describe('dates utility', () => {
  describe('formatDateTime', () => {
    it('should format a date with default options', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatDateTime(testDate);

      assert(typeof result === 'string');
      assert(result.length > 0);
    });

    it('should format a date as en-US locale', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      assert(result.includes('January'));
      assert(result.includes('15'));
      assert(result.includes('2025'));
    });

    it('should respect the timeZone option', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');

      const utcResult = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const nyResult = dates.formatDateTime(testDate, {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // The times should be different due to different timezones
      assert.notStrictEqual(utcResult, nyResult);
    });

    it('should format time in 12-hour format when hour12 is true', () => {
      const testDate = new Date('2025-01-15T15:30:00Z');
      const result = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      assert(result.includes('PM'));
    });

    it('should format time in 24-hour format when hour12 is false', () => {
      const testDate = new Date('2025-01-15T15:30:00Z');
      const result = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      assert(result.includes('15'));
    });

    it('should include weekday when specified', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        weekday: 'long',
      });

      assert(result.includes('Wednesday'));
    });

    it('should use short weekday format when specified', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatDateTime(testDate, {
        timeZone: 'UTC',
        weekday: 'short',
      });

      assert(result.includes('Wed'));
    });

    it('should handle empty options object', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatDateTime(testDate, {});

      assert(typeof result === 'string');
      assert(result.length > 0);
    });

    it('should handle various timezones correctly', () => {
      const testDate = new Date('2025-01-15T10:00:00Z');

      const timezones = [
        'America/Los_Angeles',
        'America/Denver',
        'America/Chicago',
        'America/New_York',
        'Europe/London',
        'Europe/Amsterdam',
        'Europe/Helsinki',
        'Europe/Moscow',
        'Asia/Kolkata',
        'Asia/Shanghai',
        'Asia/Tokyo',
        'Australia/Sydney',
      ];

      for (const tz of timezones) {
        const result = dates.formatDateTime(testDate, {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        assert(typeof result === 'string');
        assert(result.length > 0);
      }
    });
  });

  describe('formatTimezones', () => {
    it('should return an object with utc and timezones properties', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      assert(result.utc);
      assert(result.timezones);
      assert(typeof result.utc === 'string');
      assert(Array.isArray(result.timezones));
    });

    it('should include UTC time formatted with all details', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      assert(result.utc.includes('Wed'));
      assert(result.utc.includes('Jan'));
      assert(result.utc.includes('15'));
      assert(result.utc.includes('2025'));
    });

    it('should have 12 timezone entries', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      assert.strictEqual(result.timezones.length, 12);
    });

    it('each timezone entry should have label and time', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      result.timezones.forEach(entry => {
        assert(typeof entry.label === 'string');
        assert(typeof entry.time === 'string');
        assert(entry.label.length > 0);
        assert(entry.time.length > 0);
      });
    });

    it('should include all expected timezones', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      const labels = result.timezones.map(tz => tz.label);

      assert(labels.includes('US / Pacific'));
      assert(labels.includes('US / Mountain'));
      assert(labels.includes('US / Central'));
      assert(labels.includes('US / Eastern'));
      assert(labels.includes('EU / Western'));
      assert(labels.includes('EU / Central'));
      assert(labels.includes('EU / Eastern'));
      assert(labels.includes('Moscow'));
      assert(labels.includes('Chennai'));
      assert(labels.includes('Hangzhou'));
      assert(labels.includes('Tokyo'));
      assert(labels.includes('Sydney'));
    });

    it('should format times in different timezones correctly', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      // All times should be formatted as "day, date mon, year, time AM/PM"
      result.timezones.forEach(entry => {
        assert(entry.time.match(/\d{1,2}:\d{2}/));
      });
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2025-01-15T10:30:00Z');
      const date2 = new Date('2025-06-15T10:30:00Z');

      const result1 = dates.formatTimezones(date1);
      const result2 = dates.formatTimezones(date2);

      // Results should be different for different dates
      assert.notStrictEqual(result1.utc, result2.utc);
    });

    it('should handle dates at year boundaries', () => {
      const testDate = new Date('2024-12-31T23:59:00Z');
      const result = dates.formatTimezones(testDate);

      assert(result.utc);
      assert(result.utc.length > 0);
      assert(result.timezones.length === 12);
    });

    it('should handle dates at month boundaries', () => {
      const testDate = new Date('2025-02-01T00:00:00Z');
      const result = dates.formatTimezones(testDate);

      assert(result.utc.includes('Feb'));
      assert(result.utc.includes('01'));
    });

    it('should format UTC time with weekday, date and time', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');
      const result = dates.formatTimezones(testDate);

      // UTC time should include weekday and date
      assert(result.utc);
      assert(result.utc.match(/\w+/));
      assert(result.utc.match(/\d{1,2}/));
    });
  });
});
