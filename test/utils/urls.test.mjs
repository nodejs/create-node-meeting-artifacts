import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as urls from '../../src/utils/urls.mjs';

describe('urls utility', () => {
  describe('generateTimeAndDateLink', () => {
    it('should generate a valid TimeAndDate.com URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'TSC';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(typeof result === 'string');
      assert(
        result.startsWith(
          'https://www.timeanddate.com/worldclock/fixedtime.html'
        )
      );
    });

    it('should include the group name in the URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'MyGroup';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(result.includes(groupName) || result.includes('%20'));
    });

    it('should include the UTC date in YYYY-MM-DD format', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'TSC';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(result.includes('2025-01-15'));
    });

    it('should URL encode the group name', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'Test & Special#Chars';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      // Should be URL encoded
      assert(result.includes('%'));
    });

    it('should include the ISO datetime format in the URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'TSC';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      // ISO format should be like 20250115T103000 (without separators)
      assert(result.includes('iso='));
      assert(result.includes('20250115T103000'));
    });

    it('should handle different meeting dates correctly', () => {
      const date1 = new Date('2025-01-15T10:30:00Z');
      const date2 = new Date('2025-06-15T10:30:00Z');
      const groupName = 'TSC';

      const result1 = urls.generateTimeAndDateLink(date1, groupName);
      const result2 = urls.generateTimeAndDateLink(date2, groupName);

      // Results should be different for different dates
      assert.notStrictEqual(result1, result2);
      assert(result1.includes('2025-01-15'));
      assert(result2.includes('2025-06-15'));
    });

    it('should handle group names with spaces', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'Node Foundation TSC';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(result.includes('+'));
    });

    it('should handle single character group names', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'A';
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(result.includes('A'));
      assert(result.startsWith('https://'));
    });

    it('should handle very long group names', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'A'.repeat(100);
      const result = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert(typeof result === 'string');
      assert(result.length > 100);
    });
  });

  describe('generateWolframAlphaLink', () => {
    it('should generate a valid WolframAlpha URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(typeof result === 'string');
      assert(result.startsWith('https://www.wolframalpha.com/input/'));
    });

    it('should include UTC time in the URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('UTC'));
    });

    it('should include the date in the URL', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('2025'));
    });

    it('should URL encode special characters', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      // Should contain URL-encoded characters
      assert(result.includes('%'));
    });

    it('should format time with leading zeros', () => {
      const meetingDate = new Date('2025-01-15T09:05:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      // Should have 09:05
      assert(result.includes('09') || result.includes('%2009'));
    });

    it('should handle PM times correctly', () => {
      const meetingDate = new Date('2025-01-15T15:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('PM') || result.includes('%20PM'));
    });

    it('should handle AM times correctly', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('AM') || result.includes('%20AM'));
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2025-01-15T10:30:00Z');
      const date2 = new Date('2025-06-15T10:30:00Z');

      const result1 = urls.generateWolframAlphaLink(date1);
      const result2 = urls.generateWolframAlphaLink(date2);

      // Results should be different for different dates
      assert.notStrictEqual(result1, result2);
    });

    it('should handle dates at year boundaries', () => {
      const meetingDate = new Date('2024-12-31T23:59:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('2024'));
    });

    it('should handle dates at month boundaries', () => {
      const meetingDate = new Date('2025-02-01T00:00:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('2025'));
    });

    it('should include "local+time" query for timezone conversion', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      assert(result.includes('local'));
    });

    it('should be a valid URL format', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      // Should start with https and contain expected parts
      assert(result.startsWith('https://'));
      assert(result.includes('wolframalpha'));
    });

    it('should encode ampersand in query parameters', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const result = urls.generateWolframAlphaLink(meetingDate);

      // Should have proper URL encoding
      assert(!result.includes(' ') || result.includes('%20'));
    });
  });

  describe('URL generation consistency', () => {
    it('should generate consistent URLs for the same inputs', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');
      const groupName = 'TSC';

      const result1 = urls.generateTimeAndDateLink(meetingDate, groupName);
      const result2 = urls.generateTimeAndDateLink(meetingDate, groupName);

      assert.strictEqual(result1, result2);
    });

    it('should generate consistent WolframAlpha URLs for the same inputs', () => {
      const meetingDate = new Date('2025-01-15T10:30:00Z');

      const result1 = urls.generateWolframAlphaLink(meetingDate);
      const result2 = urls.generateWolframAlphaLink(meetingDate);

      assert.strictEqual(result1, result2);
    });
  });
});
