# Meeting Configuration Reference

Every meeting group is described by a single JSON file in the
[`meetings/`](./meetings) directory, named `<group>.meeting.json` — for example,
`tsc.meeting.json`. Each file follows the **identical format** documented below.

All meeting artifacts — both the GitHub issue and the HackMD minutes — are
rendered from one shared template,
[`templates/meeting.mustache`](./templates/meeting.mustache), so every group's
issue and notes share the same structure.

## Filename

The filename stem is the **group identifier** you pass on the command line
(`npx . <group>`) and the value the workflows use. For example,
`meetings/tsc.meeting.json` is the `tsc` group.

## Format

```json
{
  "name": "Technical Steering Committee (TSC)",
  "host": "Node.js",
  "calendar": {
    "filter": "Node.js TSC Meeting",
    "url": "https://calendar.google.com/calendar/ical/<id>/public/basic.ics"
  },
  "github": {
    "owner": "nodejs",
    "repo": "TSC",
    "agendaLabel": "tsc-agenda",
    "issueLabels": ["tsc-meeting"]
  },
  "hackmd": {
    "team": "openjs-nodejs"
  },
  "joining": {
    "participant": "https://zoom.us/j/611357642",
    "observer": "https://www.youtube.com/c/nodejs+foundation/live",
    "notes": "Regular password."
  },
  "invited": ["@nodejs/tsc"],
  "observers": [],
  "agenda": []
}
```

## Fields

### Top level

| Field       | Required | Description                                                              |
| ----------- | -------- | ------------------------------------------------------------------------ |
| `name`      | ✅       | Human-readable group name, used in the meeting title.                    |
| `host`      | ❌       | Meeting host. Defaults to `"Node.js"`. Use `"OpenJS Foundation"` etc.    |
| `calendar`  | ✅       | Calendar lookup configuration (see below).                               |
| `github`    | ✅       | GitHub configuration (see below).                                        |
| `hackmd`    | ✅       | HackMD configuration (see below).                                        |
| `joining`   | ✅       | How to join/observe the meeting (see below).                             |
| `invited`   | ✅       | Array of invited attendees (GitHub team mentions or names).              |
| `observers` | ❌       | Array of standing observers. Defaults to `[]`.                           |
| `agenda`    | ❌       | Array of manually-curated agenda sections (see below). Defaults to `[]`. |

### `calendar`

| Field    | Required | Description                                                                               |
| -------- | -------- | ----------------------------------------------------------------------------------------- |
| `filter` | ✅       | Text matched against calendar event summaries/descriptions.                               |
| `url`    | ✅       | The iCal feed URL searched for the next meeting occurrence.                               |
| `page`   | ❌       | Public "add to your calendar" page linked from the minutes. Defaults by host (see below). |

The `page` default is `https://calendar.openjsf.org` when `host` is
`"OpenJS Foundation"`, otherwise `https://nodejs.org/calendar`.

### `github`

| Field         | Required | Description                                                        |
| ------------- | -------- | ------------------------------------------------------------------ |
| `owner`       | ✅       | Organization/user that owns the meeting repository.                |
| `repo`        | ✅       | Repository where the meeting issue is created.                     |
| `agendaLabel` | ❌       | Label used to collect agenda issues. Defaults to `<group>-agenda`. |
| `issueLabels` | ❌       | Labels applied to the created meeting issue.                       |

Agenda items are gathered from issues and pull requests across the entire
`owner` organization that carry the `agendaLabel`.

### `hackmd`

| Field  | Required | Description                                        |
| ------ | -------- | -------------------------------------------------- |
| `team` | ✅       | HackMD team the minutes document is created under. |

### `joining`

| Field         | Required | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| `participant` | ❌       | Where participants join (a URL or a short instruction).       |
| `sessions`    | ❌       | Alternating sessions with per-session join links (see below). |
| `observer`    | ❌       | Where observers watch the livestream (a URL).                 |
| `notes`       | ❌       | Any additional joining notes (e.g. "Regular password.").      |

#### Alternating sessions

Some groups alternate between time slots that each have their own join link — for
example, the TSC rotates between a 13:00 UTC and a 17:00 UTC slot, each running
every two weeks. Model these with `joining.sessions` instead of a single
`participant`:

```json
"joining": {
  "observer": "https://www.youtube.com/c/nodejs+foundation/live",
  "sessions": [
    { "time": "13:00", "participant": "https://zoom-lfx.platform.linuxfoundation.org/meeting/94552847907?password=..." },
    { "time": "17:00", "participant": "https://zoom-lfx.platform.linuxfoundation.org/meeting/96540765177?password=..." }
  ]
}
```

`time` is the **UTC** time of day (`HH:MM`). When the tool finds the next
occurrence on the calendar, it selects the session whose `time` matches that
occurrence's UTC time and shows its link. If no session matches (such as a
`--dry-run`, which has no real occurrence), every session is listed.

| Field         | Required | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| `time`        | ✅       | UTC time of day in `HH:MM` form.            |
| `participant` | ✅       | Where participants join this session (URL). |

### `agenda` (manual sections)

Use this for groups that maintain curated, recurring sections in addition to the
label-driven agenda — for example, the TSC's reminders, the CPC's working-group
updates, or the Security WG's standing review items. These sections render in the
**minutes only** (the GitHub issue stays focused on the label-driven agenda and
joining details), and they appear before the label-driven "Issues and Pull
Requests" section. A section with an empty `items` array renders just its heading
(useful for live-filled sections like "Strategic Initiatives"). Each section is:

| Field         | Required | Description                          |
| ------------- | -------- | ------------------------------------ |
| `title`       | ✅       | Section heading.                     |
| `description` | ❌       | Text rendered under the heading.     |
| `items`       | ✅       | Bullet list items (typically links). |

Example:

```json
"agenda": [
  {
    "title": "Regular Reviews",
    "description": "Please review our standing list before the meeting:",
    "items": [
      "https://github.com/nodejs/TSC/labels/tsc-review"
    ]
  }
]
```
