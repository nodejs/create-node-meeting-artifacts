import type { RestEndpointMethodTypes } from '@octokit/rest';

/**
 * A GitHub issue as returned by the REST API.
 */
export type GitHubIssue =
  RestEndpointMethodTypes['issues']['create']['response']['data'];

/**
 * Environment configuration object (credentials read from the environment).
 */
export interface EnvironmentConfig {
  /** GitHub personal access token */
  githubToken: string;
  /** HackMD API configuration */
  hackmd: HackMDConfig;
}

/**
 * CLI flags parsed from the command line.
 */
export interface CLIConfig {
  verbose: boolean;
  force: boolean;
  dryRun: boolean;
  meetingGroup: string;
}

export type AppConfig = EnvironmentConfig & CLIConfig;

/**
 * HackMD API configuration.
 */
export interface HackMDConfig {
  /** HackMD API token */
  apiToken: string;
}

/**
 * A single repository's worth of agenda issues, grouped for rendering.
 */
export interface AgendaGroup {
  /** Repository in `owner/name` form */
  repo: string;
  /** Issues/PRs labelled for the agenda within this repository */
  issues: GitHubIssue[];
}

/**
 * A manually-curated agenda section declared in a meeting config.
 */
export interface AgendaSection {
  /** Section heading */
  title: string;
  /** Optional descriptive text rendered under the heading */
  description?: string;
  /** Bullet list items (typically links) */
  items: string[];
}

/**
 * One alternating meeting session, identified by its UTC time of day.
 */
export interface MeetingSession {
  /** UTC time of day in `HH:MM` form, matched against the occurrence */
  time: string;
  /** Where participants join this session (URL) */
  participant: string;
}

/**
 * A meeting configuration, loaded from `meetings/<group>.meeting.json`.
 *
 * Every meeting — regardless of group — is described by this identical shape,
 * which drives both the GitHub issue and the HackMD minutes.
 */
export interface MeetingConfig {
  /** The group identifier, derived from the config filename */
  group: string;
  /** Human-readable group name, e.g. "Technical Steering Committee (TSC)" */
  name: string;
  /** Meeting host, e.g. "Node.js" or "OpenJS Foundation" (defaults to Node.js) */
  host: string;
  /** Calendar lookup configuration */
  calendar: {
    /** Text used to match the calendar event summary/description */
    filter: string;
    /** iCal feed URL to search for the next occurrence */
    url: string;
    /** Public "add to your calendar" page (defaults based on host) */
    page?: string;
  };
  /** GitHub configuration */
  github: {
    /** Organization/user that owns the meeting repository */
    owner: string;
    /** Repository where the meeting issue is created */
    repo: string;
    /** Label used to collect agenda issues (defaults to `<group>-agenda`) */
    agendaLabel: string;
    /** Optional labels applied to the created meeting issue */
    issueLabels?: string[];
  };
  /** HackMD configuration */
  hackmd: {
    /** HackMD team name the minutes document is created under */
    team: string;
  };
  /** How to join/observe the meeting */
  joining: {
    /** Where participants join (URL or short instruction) */
    participant?: string;
    /**
     * Alternating sessions, each with its own join link, selected by the
     * occurrence's UTC time of day (e.g. a 13:00 and a 17:00 slot).
     */
    sessions?: MeetingSession[];
    /** Where observers watch the livestream (URL) */
    observer?: string;
    /** Any additional joining notes */
    notes?: string;
  };
  /** People/teams always invited */
  invited: string[];
  /** People/teams attending as observers (optional) */
  observers?: string[];
  /** Manually-curated agenda sections (optional) */
  agenda?: AgendaSection[];
}
