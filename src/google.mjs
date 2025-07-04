import { calendar } from '@googleapis/calendar';
import { drive } from '@googleapis/drive';
import { GoogleAuth } from 'google-auth-library';

import {
  GOOGLE_SCOPES,
  GOOGLE_DOC_MIME_TYPE,
  GOOGLE_FOLDER_MIME_TYPE,
  NODEJS_MEETINGS_FOLDER_NAME,
  TIME_CONSTANTS,
} from './constants.mjs';

/**
 * Creates a Google Auth client using either OAuth or service account credentials
 * @param {import('./types.d.ts').GoogleConfig} gConfig - Google authentication configuration
 * @returns {GoogleAuthClient} Configured Google Auth client
 */
export const createGoogleAuthClient = gConfig => {
  // Use Service Account authentication for automated environments (GitHub Actions)
  if (gConfig.serviceAccountEmail && gConfig.serviceAccountPrivateKey) {
    return new GoogleAuth({
      credentials: {
        client_email: gConfig.serviceAccountEmail,
        // Replace escaped newlines with actual newlines in private key
        private_key: gConfig.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      },
      scopes: GOOGLE_SCOPES,
    });
  }

  // Use OAuth authentication for local development
  return new GoogleAuth({
    credentials: {
      client_id: gConfig.clientId,
      client_secret: gConfig.clientSecret,
      redirect_uris: [gConfig.redirectUri],
    },
    scopes: GOOGLE_SCOPES,
  });
};

/**
 * Finds the next meeting event in Google Calendar within the next week
 * @param {CalendarClient} calendarClient - Google Calendar client
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @returns {Promise<CalendarEvent>} Calendar event object
 */
export const findNextMeetingEvent = async (calendarClient, meetingConfig) => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + TIME_CONSTANTS.WEEK_IN_MS);

  // Search for events in the specified calendar using the filter text
  const response = await calendarClient.events.list({
    calendarId: meetingConfig.properties.CALENDAR_ID?.replace(/"/g, ''),
    timeMin: now.toISOString(),
    timeMax: nextWeek.toISOString(),
    singleEvents: true,
    // Replace spaces with dots for Google Calendar search compatibility
    q: meetingConfig.properties.CALENDAR_FILTER?.replace(/"/g, '').replace(
      / /g,
      '.'
    ),
  });

  // Ensure we found at least one event
  if (!response.data.items || response.data.items.length === 0) {
    throw new Error('Could not find calendar event for the next week');
  }

  // Return the first (next) event found
  return response.data.items[0];
};

/**
 * Finds a folder by name in Google Drive
 * @param {DriveClient} driveClient - Google Drive client
 * @param {string} folderName - Name of the folder to find
 * @returns {Promise<string>} Folder ID
 */
export const findFolder = async (driveClient, folderName) => {
  // Search for the folder (assuming it exists)
  const searchResponse = await driveClient.files.list({
    q: `name='${folderName}' and mimeType='${GOOGLE_FOLDER_MIME_TYPE}' and trashed=false`,
    fields: 'files(id, name)',
  });

  // Return the folder ID
  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  throw new Error(`${folderName} folder not found in Google Drive`);
};

/**
 * Uploads minutes document to Google Drive in the nodejs-meetings folder
 * @param {DriveClient} driveClient - Google Drive client
 * @param {string} title - Document title
 * @param {string} content - Document content
 * @returns {Promise<DriveFile>} Upload result with document ID
 */
export const uploadMinutesDocument = async (driveClient, title, content) => {
  // Find the nodejs-meetings folder
  const folderId = await findFolder(driveClient, NODEJS_MEETINGS_FOLDER_NAME);

  // Create a new Google Doc with the meeting minutes content in the correct folder
  const response = await driveClient.files.create({
    requestBody: {
      name: title,
      mimeType: GOOGLE_DOC_MIME_TYPE,
      parents: [folderId],
    },
    media: { mimeType: 'text/plain', body: content },
  });

  return response.data;
};

/**
 * Creates Google API clients from authenticated client
 * @param {GoogleAuthClient} googleAuth - Authenticated Google Auth client
 * @returns {Promise<import('./types.d.ts').GoogleClients>} Google API clients
 */
export const createGoogleClients = async googleAuth => {
  // Get the authenticated client for API calls
  const authClient = await googleAuth.getClient();

  // Return configured Calendar and Drive API clients
  return {
    calendarClient: calendar({ version: 'v3', auth: authClient }),
    driveClient: drive({ version: 'v3', auth: authClient }),
  };
};
