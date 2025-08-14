/**
 * Application configuration object
 */
export interface AppConfig {
  /** Meeting group from command line argument */
  meetingGroup: string;
  /** GitHub personal access token */
  githubToken: string;
  /** Google API configuration (Calendar only) */
  google: GoogleConfig;
  /** HackMD API configuration */
  hackmd: HackMDConfig;
  /** Directory paths configuration */
  directories: DirectoryConfig;
}

/**
 * Google authentication configuration (Calendar only)
 */
export interface GoogleConfig {
  /** Google API Key for Calendar access */
  apiKey?: string;
}

/**
 * HackMD API configuration
 */
export interface HackMDConfig {
  /** HackMD API token */
  apiToken: string;
  /** HackMD team name/path */
  teamName?: string;
}

/**
 * Directory paths configuration
 */
export interface DirectoryConfig {
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
}

/**
 * Meeting properties parsed from template file
 */
export interface MeetingProperties {
  /** Calendar ID to search for events */
  CALENDAR_ID?: string;
  /** Text filter for calendar events */
  CALENDAR_FILTER?: string;
  /** GitHub repository owner/user */
  USER?: string;
  /** GitHub repository name */
  REPO?: string;
  /** Host organization name (e.g. "Node.js", "OpenJS Foundation") */
  HOST?: string;
  /** Display name for the meeting group */
  GROUP_NAME?: string;
  /** Meeting agenda tag for labeling issues */
  AGENDA_TAG?: string;
  /** Optional GitHub issue label */
  ISSUE_LABEL?: string;
  /** Meeting joining instructions */
  JOINING_INSTRUCTIONS?: string;
}
