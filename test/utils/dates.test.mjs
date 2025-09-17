import assert from 'node:assert';
import { describe, it } from 'node:test';

import { formatDateTime, formatTimezones } from '../../src/utils/dates.mjs';

describe('Utils - Dates', () => {
  describe('formatDateTime', () => {
    it('should format date with default options', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatDateTime(date);

      assert.strictEqual(typeof result, 'string');
      assert.ok(result.length > 0);
    });

    it('should format date with custom options', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      const result = formatDateTime(date, options);

      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('2023'));
      assert.ok(result.includes('October'));
    });

    it('should format date with timezone option', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const options = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };

      const result = formatDateTime(date, options);

      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('AM') || result.includes('PM'));
    });

    it('should handle edge cases with invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');

      assert.throws(() => {
        formatDateTime(invalidDate);
      });
    });
  });

  describe('formatTimezones', () => {
    it('should return object with utc and timezones properties', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatTimezones(date);

      assert.strictEqual(typeof result, 'object');
      assert.ok(Object.hasOwn(result, 'utc'));
      assert.ok(Object.hasOwn(result, 'timezones'));
    });

    it('should format UTC time correctly', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatTimezones(date);

      assert.strictEqual(typeof result.utc, 'string');
      assert.ok(result.utc.includes('2023'));
      assert.ok(result.utc.includes('Oct'));
      assert.ok(result.utc.includes('2:30'));
    });

    it('should return array of timezone objects', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatTimezones(date);

      assert.ok(Array.isArray(result.timezones));
      assert.ok(result.timezones.length > 0);

      // Check first timezone object structure
      const firstTz = result.timezones[0];

      assert.ok(Object.hasOwn(firstTz, 'label'));
      assert.ok(Object.hasOwn(firstTz, 'time'));
      assert.strictEqual(typeof firstTz.label, 'string');
      assert.strictEqual(typeof firstTz.time, 'string');
    });

    it('should include all expected timezones', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatTimezones(date);

      const expectedLabels = [
        'US / Pacific',
        'US / Mountain',
        'US / Central',
        'US / Eastern',
        'EU / Western',
        'EU / Central',
        'EU / Eastern',
        'Moscow',
        'Chennai',
        'Hangzhou',
        'Tokyo',
        'Sydney',
      ];

      const actualLabels = result.timezones.map(tz => tz.label);

      expectedLabels.forEach(label => {
        assert.ok(actualLabels.includes(label), `Missing timezone: ${label}`);
      });
    });

    it('should format times for different timezones', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const result = formatTimezones(date);

      // Check that different timezones have different times
      const times = result.timezones.map(tz => tz.time);
      const uniqueTimes = new Set(times);

      // Should have multiple unique times since timezones differ
      assert.ok(uniqueTimes.size > 1);
    });

    it('should handle midnight edge case', () => {
      const date = new Date('2023-10-15T00:00:00Z');
      const result = formatTimezones(date);

      assert.strictEqual(typeof result.utc, 'string');
      assert.ok(result.utc.includes('12:00'));
      assert.ok(result.timezones.length > 0);
    });

    it('should handle noon edge case', () => {
      const date = new Date('2023-10-15T12:00:00Z');
      const result = formatTimezones(date);

      assert.strictEqual(typeof result.utc, 'string');
      assert.ok(result.utc.includes('12:00'));
      assert.ok(result.timezones.length > 0);
    });
  });
});
