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
}

export interface MeetingConfig {
  github: {
    owner: string;
    repo: string;
    agendaTag: string;
  };
  meeting: {
    displayName: string;
    labels?: string[];
    calendar: {
      id: string;
      filter: string;
    };
    links: {
      participant: string;
      observer: string;
    };
    invitees: string[];
  };
  hackmd: {
    team: string;
  };
  agenda: {
    title: string;
    description?: string;
    items: string[];
  }[];
}
