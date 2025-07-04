// Google API scopes required for calendar and drive access
export const GOOGLE_SCOPES = [
  // Read calendar events to find next meeting
  'https://www.googleapis.com/auth/calendar.readonly',
  // Create Google Docs for minutes
  'https://www.googleapis.com/auth/drive.file',
];

// Default configuration values
export const DEFAULT_CONFIG = {
  // Default OAuth redirect URI for local development
  redirectUri: 'http://localhost:3000/oauth2callback',
  // Default GitHub organization name
  githubOrg: 'nodejs',
  // Default GitHub issue assignee
  assignee: 'mhdawson',
};

// Template variable placeholders used in meeting minutes
export const TEMPLATE_VARIABLES = {
  // Placeholder for meeting title
  TITLE: '$TITLE$',
  // Placeholder for agenda content
  AGENDA_CONTENT: '$AGENDA_CONTENT$',
  // Placeholder for invited attendees list
  INVITED: '$INVITED$',
  // Placeholder for observers list
  OBSERVERS: '$OBSERVERS$',
};

// Google Docs MIME type for creating documents
export const GOOGLE_DOC_MIME_TYPE = 'application/vnd.google-apps.document';

// Google Drive folder MIME type for creating/searching folders
export const GOOGLE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

// Name of the Google Drive folder where meeting minutes are stored
export const NODEJS_MEETINGS_FOLDER_NAME = 'nodejs-meetings';

// Regular expressions for updating issue content
export const ISSUE_UPDATE_REGEXES = {
  // Matches empty Google Doc placeholder to replace with actual link
  EMPTY_GOOGLE_DOC: /\* \*\*Minutes Google Doc\*\*: <>/,
  // Matches previous minutes placeholder line to remove
  PREVIOUS_MINUTES: /\* _Previous Minutes Google Doc: <>_/,
};

// Time constants for date calculations
export const TIME_CONSTANTS = {
  // Week in milliseconds for calendar search
  WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
};
