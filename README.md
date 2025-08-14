# Node.js Meeting Artifacts Creator

A modern Node.js application that creates GitHub issues and HackMD documents for Node.js team meetings. This tool automates the process of reading meeting configuration, fetching calendar events, creating meeting minutes documents, and posting GitHub issues.

## 📋 Requirements

- Node.js 22+ (LTS)
- GitHub Personal Access Token
- Google Cloud Project with Calendar API enabled (for meeting scheduling)
- Google API Key for Calendar access
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

### Google Authentication (Calendar Only)

#### API Key Authentication (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the API key to the Google Calendar API for security
6. Add the API key to your environment variables as `GOOGLE_API_KEY`

**Note:** API Keys provide simplified authentication and are sufficient for read-only calendar access. They don't require complex OAuth flows or service account setup.

## 🎯 Available Meeting Commands

| Meeting Group            | Production Command                         | Development Command                            |
| ------------------------ | ------------------------------------------ | ---------------------------------------------- |
| UVWASI                   | `npm run uvwasi-meeting`                   | `npm run uvwasi-meeting:dev`                   |
| TSC                      | `npm run tsc-meeting`                      | `npm run tsc-meeting:dev`                      |
| Build                    | `npm run build-meeting`                    | `npm run build-meeting:dev`                    |
| Diagnostics              | `npm run diag-meeting`                     | `npm run diag-meeting:dev`                     |
| Diagnostics Deep Dive    | `npm run diag-deepdive-meeting`            | `npm run diag-deepdive-meeting:dev`            |
| TypeScript               | `npm run typescript-meeting`               | `npm run typescript-meeting:dev`               |
| Release                  | `npm run release-meeting`                  | `npm run release-meeting:dev`                  |
| Cross Project Council    | `npm run cross-project-council-meeting`    | `npm run cross-project-council-meeting:dev`    |
| Modules                  | `npm run modules-meeting`                  | `npm run modules-meeting:dev`                  |
| Tooling                  | `npm run tooling-meeting`                  | `npm run tooling-meeting:dev`                  |
| Security WG              | `npm run security-wg-meeting`              | `npm run security-wg-meeting:dev`              |
| Next-10                  | `npm run next-10-meeting`                  | `npm run next-10-meeting:dev`                  |
| Package Maintenance      | `npm run package-maintenance-meeting`      | `npm run package-maintenance-meeting:dev`      |
| Package Metadata Interop | `npm run package-metadata-interop-meeting` | `npm run package-metadata-interop-meeting:dev` |
| Ecosystem Report         | `npm run ecosystem-report-meeting`         | `npm run ecosystem-report-meeting:dev`         |
| Sustainability Collab    | `npm run sustainability-collab-meeting`    | `npm run sustainability-collab-meeting:dev`    |
| Standards                | `npm run standards-meeting`                | `npm run standards-meeting:dev`                |
| Security Collab          | `npm run security-collab-meeting`          | `npm run security-collab-meeting:dev`          |
| Loaders                  | `npm run loaders-meeting`                  | `npm run loaders-meeting:dev`                  |
| Web Server Frameworks    | `npm run web-server-frameworks-meeting`    | `npm run web-server-frameworks-meeting:dev`    |

## 📁 Project Structure

```
create-node-meeting-artifacts/
├── src/
│   ├── config.mjs             # Configuration management
│   ├── constants.mjs          # Application constants
│   ├── github.mjs             # GitHub API integration
│   ├── google.mjs             # Google APIs integration
│   ├── meeting.mjs            # Meeting operations
│   └── utils.mjs              # Utility functions
├── templates/                 # Meeting templates
├── .nvmrc                     # Node.js version
├── .env.example              # Environment variables example
├── create-node-meeting-artifacts.mjs # Main application
├── TEMPLATES_DOCUMENTATION.md # Template creation guide
└── README.md                  # This file
```

## 📝 Meeting Templates

Meeting configurations are stored in the `templates/` directory. Each meeting group requires four template files:

- `invited_<group>`: List of invited attendees (GitHub team mentions)
- `observers_<group>`: List of observers with their details
- `meeting_base_<group>`: Base meeting configuration (calendar ID, GitHub repo, etc.)
- `minutes_base_<group>`: Template for meeting minutes document

For detailed information about creating new templates, see [TEMPLATES_DOCUMENTATION.md](./TEMPLATES_DOCUMENTATION.md).

### Template Variables

Templates support the following replacement variables:

- `$TITLE$`: Meeting title
- `$AGENDA_CONTENT$`: Auto-generated agenda items
- `$INVITED$`: Invited attendees list
- `$OBSERVERS$`: Observers list
- `$GITHUB_ISSUE$`: GitHub issue URL
- `$MINUTES_DOC$`: Google Doc URL

## ➕ Adding New Meeting Groups

To add a new meeting group to the system, you need to create templates and update configuration in three places:

### 1. Create Template Files

Create four template files in the `templates/` directory following the naming convention:

```bash
# Replace <shortname> with your meeting group identifier
templates/invited_<shortname>
templates/observers_<shortname>
templates/meeting_base_<shortname>
templates/minutes_base_<shortname>
```

See [TEMPLATES_DOCUMENTATION.md](./TEMPLATES_DOCUMENTATION.md) for detailed template examples and variable explanations.

### 2. Update GitHub Actions Workflow

Add your meeting group to `.github/workflows/create-meeting-artifacts.yml`:

```yaml
workflow_dispatch:
  inputs:
    meeting_group:
      description: 'Meeting group to create artifacts for'
      required: true
      type: choice
      options:
        - uvwasi
        - tsc
        - build
        # ... existing groups ...
        - your-new-group # Add your group here
```

### 3. Update Package.json Scripts

Add npm scripts to `package.json` following this pattern:

```json
{
  "scripts": {
    "your-meeting-group-meeting": "node create-node-meeting-artifacts.mjs your_meeting_group",
    "your-meeting-group-meeting:dev": "node --env-file=.env create-node-meeting-artifacts.mjs your_meeting_group"
  }
}
```

**Important Notes:**

- Use **kebab-case** for script names: `your-meeting-group-meeting`
- Use **snake_case** for the actual group parameter: `your_meeting_group`
- Always create both production and development (`:dev`) versions
- The development version uses `--env-file=.env` for local testing

## 🏗️ Development

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your credentials
4. Create meeting artifacts: `npm run <group>-meeting:dev`

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
# Using npm scripts (recommended)
npm run tsc-meeting:dev

# Direct execution
node --env-file=.env create-node-meeting-artifacts.mjs tsc
```

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
- `GOOGLE_API_KEY`: Google Calendar API Key for read-only calendar access

#### Optional

- `HACKMD_TEAM_NAME`: HackMD team name/path for team workspaces

### Meeting Base Configuration

Each `meeting_base_<group>` file contains:

```bash
CALENDAR_FILTER="Meeting Name in Calendar"
CALENDAR_ID="nodejs.org_nr77ama8p7d7f9ajrpnu506c98@group.calendar.google.com"
USER="nodejs"
REPO="repository-name"
GROUP_NAME="Full Group Name"
AGENDA_TAG="agenda-label"
ISSUE_LABEL="optional-issue-label"
JOINING_INSTRUCTIONS="Meeting join instructions"
```
