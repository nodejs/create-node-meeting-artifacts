# Node.js Meeting Artifacts Creator

A modern Node.js application that creates GitHub issues and HackMD documents for Node.js team meetings. This tool automates the process of reading meeting configuration, fetching calendar events, creating meeting minutes documents, and posting GitHub issues.

## 📋 Requirements

- Node.js 22+ (LTS)
- GitHub Personal Access Token
- HackMD API Token (for meeting minutes)

## 🔑 Authentication Setup

### GitHub Authentication

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Grant the following permissions:
   - `repo` (Full control of private repositories)
   - `user` (Read user information)

### HackMD Authentication

1. Go to [HackMD](https://hackmd.io/) and sign in to your account
2. Navigate to Account Settings > API Tokens
3. Create a new API token for the meeting artifacts tool
4. Optionally, create or join a team workspace for better organization

## 📁 Project Structure

```
create-node-meeting-artifacts/
├── src/
│   ├── config.mjs             # Environment configuration (API tokens)
│   ├── constants.mjs          # Application constants
│   ├── github.mjs             # GitHub API integration
│   ├── calendar.mjs           # Calendar integration
│   ├── hackmd.mjs             # HackMD API integration
│   ├── meeting.mjs            # Config loading + template rendering
│   ├── types.d.ts             # Type definitions
│   └── utils/                 # Date and URL helpers
├── meetings/                  # One <group>.meeting.json per meeting group
├── templates/
│   └── meeting.mustache       # Single shared template (issue + minutes)
├── .nvmrc                     # Node.js version
├── .env.example               # Environment variables example
├── create-node-meeting-artifacts.mjs # Main application
├── TEMPLATES_DOCUMENTATION.md # Meeting config reference
└── README.md                  # This file
```

## 📝 Meeting Configurations

Every meeting group is described by a single JSON file in the [`meetings/`](./meetings)
directory, named `<group>.meeting.json` (for example, `tsc.meeting.json`). Each
file follows an **identical format**, and the same shared
[`templates/meeting.mustache`](./templates/meeting.mustache) renders both the
GitHub issue and the HackMD minutes for every group — so every meeting's
artifacts look the same.

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
    "repo": "TSC"
  },
  "hackmd": {
    "team": "openjs-nodejs"
  },
  "joining": {
    "participant": "https://zoom.us/j/611357642",
    "observer": "https://www.youtube.com/c/nodejs+foundation/live"
  },
  "invited": ["@nodejs/tsc"]
}
```

See [TEMPLATES_DOCUMENTATION.md](./TEMPLATES_DOCUMENTATION.md) for a full reference
of every field, including the optional ones (`github.agendaLabel`,
`github.issueLabels`, `joining.notes`, `observers`, and curated `agenda` sections).

## ➕ Adding New Meeting Groups

Adding a group is a single step: create its config file.

### 1. Create the meeting config

Add `meetings/<group>.meeting.json` following the format above. The filename stem
(`<group>`) is what you pass on the command line and to the workflows.

### 2. That's it

The GitHub Actions workflows discover meeting groups automatically:

- The **scheduled** workflow builds its matrix by listing `meetings/*.meeting.json`.
- The **manual** workflow reads the owner straight from the JSON file.

No workflow edits and no `package.json` scripts are needed.

## 🏗️ Development

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your credentials
4. Create meeting artifacts: `npm run dev -- <group>` (e.g. `npm run dev -- tsc`)

### Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run check         # Run both linting and formatting checks
```

## 🚀 Usage

### Local Development

```bash
# Using npx
npx --env-file=.env . tsc

# Direct execution (with a `.env` file)
node --env-file=.env create-node-meeting-artifacts.mjs tsc

# Preview the rendered issue without creating anything
node --env-file=.env create-node-meeting-artifacts.mjs tsc --dry-run
```

The CLI accepts the following flags:

- `--dry-run`: render and print the issue without creating an issue or document
- `--force`: create a new issue/document even if one already exists
- `--verbose`: enable debug logging from the GitHub client

## 📂 Output

The application creates:

1. **GitHub Issue**: Posted to the configured repository with meeting details and agenda
2. **HackMD Document**: Meeting minutes document in Markdown format with collaborative editing
3. **Console Output**: Links to both the created issue and HackMD document

## 🔧 Configuration

### Environment Variables

#### Required

- `GITHUB_TOKEN`: GitHub Personal Access Token
- `HACKMD_API_TOKEN`: HackMD API token for creating and managing documents

### Meeting Configuration

Each meeting is configured by a `meetings/<group>.meeting.json` file. See
[TEMPLATES_DOCUMENTATION.md](./TEMPLATES_DOCUMENTATION.md) for the complete field
reference.
