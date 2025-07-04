/**
 * TypeScript definitions for the Node.js Meeting Artifacts Creator
 */

/**
 * Application configuration object
 */
export interface AppConfig {
  /** Meeting group from command line argument */
  meetingGroup: string;
  /** GitHub personal access token */
  githubToken: string;
  /** Google API configuration */
  google: GoogleConfig;
  /** Directory paths configuration */
  directories: DirectoryConfig;
}

/**
 * Google authentication configuration
 */
export interface GoogleConfig {
  /** OAuth client ID */
  clientId?: string;
  /** OAuth client secret */
  clientSecret?: string;
  /** OAuth redirect URI */
  redirectUri?: string;
  /** Service account email for automation */
  serviceAccountEmail?: string;
  /** Service account private key for automation */
  serviceAccountPrivateKey?: string;
}

/**
 * Directory paths configuration
 */
export interface DirectoryConfig {
  /** Configuration directory path */
  config: string;
  /** Output directory for meeting files */
  output: string;
  /** Templates directory path */
  templates: string;
}

/**
 * Meeting configuration object parsed from templates
 */
export interface MeetingConfig {
  /** Invited attendees list */
  invited: string;
  /** Observers list */
  observers: string;
  /** Base meeting information */
  baseMeetingInfo: string;
  /** Parsed meeting properties */
  properties: MeetingProperties;
  /** Meeting group tag for file naming */
  meetingGroupForTag: string;
  /** GitHub organization name */
  githubOrg: string;
}

/**
 * Meeting properties parsed from template file
 */
export interface MeetingProperties {
  /** Calendar ID to search for events */
  CALENDAR_ID?: string;
  /** Text filter for calendar events */
  CALENDAR_FILTER?: string;
  /** GitHub repository owner */
  USER?: string;
  /** GitHub repository name */
  REPO?: string;
  /** Optional GitHub issue label */
  ISSUE_LABEL?: string;
  /** Meeting agenda tag */
  AGENDA_TAG?: string;
  /** GitHub organization override */
  GITHUB_ORG?: string;
  /** Meeting location */
  LOCATION?: string;
  /** Meeting time */
  TIME?: string;
  /** Meeting day */
  DAY?: string;
  /** Meeting frequency */
  FREQUENCY?: string;
}

/**
 * Google API clients container
 */
export interface GoogleClients {
  /** Google Calendar API client */
  calendarClient: CalendarClient;
  /** Google Drive API client */
  driveClient: DriveClient;
}

/**
 * Meeting issue generation result
 */
export interface MeetingIssueResult {
  /** Generated issue title */
  title: string;
  /** Generated issue content */
  content: string;
}
