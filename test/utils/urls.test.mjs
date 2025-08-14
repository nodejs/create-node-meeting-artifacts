import assert from 'node:assert';
import { describe, it } from 'node:test';
import { URL } from 'node:url';

import {
  generateTimeAndDateLink,
  generateWolframAlphaLink,
} from '../../src/utils/urls.mjs';

describe('Utils - URLs', () => {
  describe('generateTimeAndDateLink', () => {
    it('should generate valid TimeAndDate.com link', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'TSC';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.strictEqual(typeof result, 'string');
      assert.ok(
        result.startsWith(
          'https://www.timeanddate.com/worldclock/fixedtime.html'
        )
      );
    });

    it('should include encoded group name in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'Security Working Group';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes(encodeURIComponent('Security Working Group')));
      assert.ok(result.includes('Security%20Working%20Group'));
    });

    it('should include formatted date in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'TSC';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes('2023-10-15'));
    });

    it('should include ISO datetime in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'TSC';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes('iso=20231015T1430'));
    });

    it('should handle group names with special characters', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'Build & Release';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes(encodeURIComponent('Build & Release')));
      assert.strictEqual(typeof result, 'string');
    });

    it('should handle midnight meeting times', () => {
      const meetingDate = new Date('2023-10-15T00:00:00Z');
      const groupName = 'TSC';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes('iso=20231015T0000'));
      assert.ok(result.includes('2023-10-15'));
    });

    it('should handle end of year dates', () => {
      const meetingDate = new Date('2023-12-31T23:59:00Z');
      const groupName = 'TSC';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes('2023-12-31'));
      assert.ok(result.includes('iso=20231231T2359'));
    });

    it('should handle single character group names', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'X';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      assert.ok(result.includes('X'));
      assert.strictEqual(typeof result, 'string');
    });

    it('should properly encode spaces and special characters', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');
      const groupName = 'Node.js Foundation Group';

      const result = generateTimeAndDateLink(meetingDate, groupName);

      // Should not contain unencoded spaces
      assert.ok(!result.includes('Node.js Foundation Group'));
      // Should contain encoded version
      assert.ok(
        result.includes(encodeURIComponent('Node.js Foundation Group'))
      );
    });
  });

  describe('generateWolframAlphaLink', () => {
    it('should generate valid WolframAlpha link', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.strictEqual(typeof result, 'string');
      assert.ok(result.startsWith('https://www.wolframalpha.com/input/?i='));
    });

    it('should include UTC time in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      // Should include 2:30 PM format
      assert.ok(result.includes('2%3A30') || result.includes('2:30'));
      assert.ok(result.includes('PM'));
    });

    it('should include UTC date in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('Oct'));
      assert.ok(result.includes('15'));
      assert.ok(result.includes('2023'));
    });

    it('should include "local time" query in URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(
        result.includes('local%20time') || result.includes('local+time')
      );
    });

    it('should handle midnight times', () => {
      const meetingDate = new Date('2023-10-15T00:00:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('12%3A00') || result.includes('12:00'));
      assert.ok(result.includes('AM'));
    });

    it('should handle noon times', () => {
      const meetingDate = new Date('2023-10-15T12:00:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('12%3A00') || result.includes('12:00'));
      assert.ok(result.includes('PM'));
    });

    it('should handle single digit minutes', () => {
      const meetingDate = new Date('2023-10-15T14:05:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('2%3A05') || result.includes('2:05'));
    });

    it('should handle end of year dates', () => {
      const meetingDate = new Date('2023-12-31T23:59:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('Dec'));
      assert.ok(result.includes('31'));
      assert.ok(result.includes('2023'));
      assert.ok(result.includes('11%3A59') || result.includes('11:59'));
      assert.ok(result.includes('PM'));
    });

    it('should properly encode the URL', () => {
      const meetingDate = new Date('2023-10-15T14:30:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      // Should be a valid URL format
      assert.doesNotThrow(() => new URL(result));

      // Should contain proper encoding
      assert.ok(result.includes('%2C') || result.includes(','));
    });

    it('should handle beginning of year dates', () => {
      const meetingDate = new Date('2023-01-01T00:00:00Z');

      const result = generateWolframAlphaLink(meetingDate);

      assert.ok(result.includes('Jan'));
      assert.ok(result.includes('1'));
      assert.ok(result.includes('2023'));
      assert.ok(result.includes('12%3A00') || result.includes('12:00'));
      assert.ok(result.includes('AM'));
    });
  });
});
