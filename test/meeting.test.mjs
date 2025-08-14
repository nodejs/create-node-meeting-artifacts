import assert from 'node:assert';
import { describe, it } from 'node:test';

import { generateMeetingTitle } from '../src/meeting.mjs';

describe('Meeting', () => {
  describe('generateMeetingTitle', () => {
    it('should generate meeting title with default values', () => {
      const config = { meetingGroup: 'tsc' };
      const meetingConfig = { properties: {} };
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(result, 'Node.js tsc Meeting 2023-10-15');
    });

    it('should use HOST from properties', () => {
      const config = { meetingGroup: 'tsc' };

      const meetingConfig = {
        properties: {
          HOST: 'OpenJS Foundation',
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(result, 'OpenJS Foundation tsc Meeting 2023-10-15');
    });

    it('should use GROUP_NAME from properties', () => {
      const config = { meetingGroup: 'tsc' };

      const meetingConfig = {
        properties: {
          GROUP_NAME: 'Technical Steering Committee',
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(
        result,
        'Node.js Technical Steering Committee Meeting 2023-10-15'
      );
    });

    it('should use both custom HOST and GROUP_NAME', () => {
      const config = { meetingGroup: 'tsc' };

      const meetingConfig = {
        properties: {
          HOST: 'OpenJS Foundation',
          GROUP_NAME: 'Technical Steering Committee',
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(
        result,
        'OpenJS Foundation Technical Steering Committee Meeting 2023-10-15'
      );
    });

    it('should handle different date formats correctly', () => {
      const config = { meetingGroup: 'build' };
      const meetingConfig = { properties: {} };
      const meetingDate = new Date('2023-12-31T23:59:59Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(result, 'Node.js build Meeting 2023-12-31');
    });

    it('should handle different meeting groups', () => {
      const config = { meetingGroup: 'security-wg' };

      const meetingConfig = {
        properties: {
          GROUP_NAME: 'Security Working Group',
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(
        result,
        'Node.js Security Working Group Meeting 2023-10-15'
      );
    });

    it('should handle edge case dates', () => {
      const config = { meetingGroup: 'tsc' };
      const meetingConfig = { properties: {} };
      const meetingDate = new Date('2024-02-29T12:00:00Z'); // Leap year

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(result, 'Node.js tsc Meeting 2024-02-29');
    });

    it('should handle null/undefined properties gracefully', () => {
      const config = { meetingGroup: 'tsc' };

      const meetingConfig = {
        properties: {
          HOST: null,
          GROUP_NAME: undefined,
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      // Should fall back to defaults
      assert.strictEqual(result, 'Node.js tsc Meeting 2023-10-15');
    });

    it('should handle empty string properties', () => {
      const config = { meetingGroup: 'tsc' };

      const meetingConfig = {
        properties: {
          HOST: '',
          GROUP_NAME: '',
        },
      };

      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      // Empty strings are used as-is (nullish coalescing doesn't catch empty strings)
      assert.strictEqual(result, '  Meeting 2023-10-15');
    });

    it('should handle very long meeting group names', () => {
      const config = {
        meetingGroup: 'very-long-working-group-name-for-testing-purposes',
      };

      const meetingConfig = { properties: {} };
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateMeetingTitle(config, meetingConfig, meetingDate);

      assert.strictEqual(
        result,
        'Node.js very-long-working-group-name-for-testing-purposes Meeting 2023-10-15'
      );
    });
  });
});
