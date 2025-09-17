// Default configuration values
export const DEFAULT_CONFIG = {
  // Default GitHub organization name
  githubOrg: 'nodejs',
  // Default Host of the Meeting
  host: 'Node.js',
};

// Time constants for date calculations
export const TIME_CONSTANTS = {
  // Week in milliseconds for calendar search
  WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
};

// Relevant Timezones for Date manipulation
export const RELEVANT_TIMEZONES = [
  { label: 'US / Pacific', tz: 'America/Los_Angeles' },
  { label: 'US / Mountain', tz: 'America/Denver' },
  { label: 'US / Central', tz: 'America/Chicago' },
  { label: 'US / Eastern', tz: 'America/New_York' },
  { label: 'EU / Western', tz: 'Europe/London' },
  { label: 'EU / Central', tz: 'Europe/Amsterdam' },
  { label: 'EU / Eastern', tz: 'Europe/Helsinki' },
  { label: 'Moscow', tz: 'Europe/Moscow' },
  { label: 'Chennai', tz: 'Asia/Kolkata' },
  { label: 'Hangzhou', tz: 'Asia/Shanghai' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
];

// Creates the default permissions for our generated docs
export const HACKMD_DEFAULT_PERMISSIONS = {
  readPermission: 'guest',
  writePermission: 'signed_in',
  commentPermission: 'signed_in_users',
};
