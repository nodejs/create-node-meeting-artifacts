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

## 📁 Project Structure

```
create-node-meeting-artifacts/
├── src/
│   ├── config.mjs             # Configuration management
│   ├── constants.mjs          # Application constants
│   ├── github.mjs             # GitHub API integration
│   ├── google.mjs             # Google APIs integration
│   ├── meeting.mjs            # Meeting operations
|   ├── index.mjs              # Main application
│   └── utils.mjs              # Utility functions
├── templates/                 # Meeting templates
├── .nvmrc                     # Node.js version
├── .env.example               # Environment variables example
└── README.md                  # This file
```

## ➕ Adding New Meeting Groups

To add a new meeting group to the system, you need to create a configuration file in `configs`. These configuration files should
follow the following design:

```json
{
  "github": {
    "owner": "Organization (i.e. nodejs, openjs-foundation)",
    "repo": "Repository (i.e. build)",
    "agendaTag?": "If the label isn't [filename]-agenda, put it here"
  },
  "meeting": {
    "displayName": "Who is meeting?",
    "labels?": ["If the meeting issue should be labeled, what?"],
    "calendar": {
      "id": "This is the Google Calendar ID, without the \"@...\" part.",
      "filter": "What's the meeting called?"
    },
    "links": {
      "participant": "Where do I go to participate?",
      "observer": "Where do I go to watch?"
    },
    "invitees": ["Who is invited?"],
    "observers?": ["Who is watching?"]
  },
  "hackmd": {
    "team": "Where in HackMD should the notes be generated?"
  }
}
```

## 🏗️ Development

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your credentials
4. Create meeting artifacts: `npm run dev <group>`

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
# Using npm scripts
npm run dev tsc

# Direct execution
npx . tsc
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
