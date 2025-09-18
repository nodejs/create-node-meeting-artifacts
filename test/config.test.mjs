import assert from 'node:assert';
import process from 'node:process';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { getConfig } from '../src/config.mjs';

describe('Config', () => {
  let originalEnv;
  let originalArgv;

  beforeEach(() => {
    // Save original environment and argv
    originalEnv = { ...process.env };
    originalArgv = [...process.argv];
  });

  afterEach(() => {
    // Restore original environment and argv
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  describe('getConfig', () => {
    it('should return empty meeting group when no argument provided', () => {
      process.argv = ['node', 'script.mjs'];

      const config = getConfig();

      assert.strictEqual(config.meetingGroup, undefined);
    });

    it('should use command line argument for meeting group', () => {
      process.argv = ['node', 'script.mjs', 'build'];

      const config = getConfig();

      assert.strictEqual(config.meetingGroup, 'build');
    });

    it('should read GitHub token from environment', () => {
      process.env.GITHUB_TOKEN = 'test_token';

      const config = getConfig();

      assert.strictEqual(config.githubToken, 'test_token');
    });

    it('should read Google API Key config from environment', () => {
      process.env.GOOGLE_API_KEY = 'test_google_api_key_123';

      const config = getConfig();

      assert.strictEqual(config.google.apiKey, 'test_google_api_key_123');
    });

    it('should handle missing Google API Key gracefully', () => {
      delete process.env.GOOGLE_API_KEY;

      const config = getConfig();

      assert.strictEqual(config.google.apiKey, undefined);
    });

    it('should read HackMD config from environment', () => {
      process.env.HACKMD_API_TOKEN = 'hackmd_token';

      const config = getConfig();

      assert.strictEqual(config.hackmd.apiToken, 'hackmd_token');
    });

    it('should handle undefined environment variables gracefully', () => {
      // Clear all relevant env vars
      delete process.env.GITHUB_TOKEN;
      delete process.env.HACKMD_API_TOKEN;
      delete process.env.GOOGLE_CLIENT_ID;

      const config = getConfig();

      assert.strictEqual(config.githubToken, undefined);
      assert.strictEqual(config.hackmd.apiToken, undefined);
      assert.strictEqual(config.google.clientId, undefined);
    });

    it('should contain all required config sections', () => {
      const config = getConfig();

      assert.ok('meetingGroup' in config);
      assert.ok('githubToken' in config);
      assert.ok('google' in config);
      assert.ok('hackmd' in config);
      assert.ok('directories' in config);
    });

    it('should contain all required directory paths', () => {
      const config = getConfig();

      assert.ok('config' in config.directories);
      assert.ok('output' in config.directories);
      assert.ok('templates' in config.directories);
    });
  });
});
