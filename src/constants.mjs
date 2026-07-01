// Default host used in meeting titles when a config does not set one
export const DEFAULT_HOST = 'Node.js';

// Host that uses the OpenJS Foundation public calendar
export const OPENJS_HOST = 'OpenJS Foundation';

// Public "add to your calendar" pages linked from the minutes
export const CALENDAR_PAGES = {
  node: 'https://nodejs.org/calendar',
  openjs: 'https://calendar.openjsf.org',
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
