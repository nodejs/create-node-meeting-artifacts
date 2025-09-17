import { calendar } from '@googleapis/calendar';

import { TIME_CONSTANTS } from './constants.mjs';

/**
 * Creates an authenticated Google Calendar client using API Key
 * @param {import('./types.d.ts').GoogleConfig} gConfig - Google configuration object
 * @returns {CalendarClient} Authenticated Google Calendar client
 */
export const createCalendarClient = ({ apiKey: auth }) =>
  calendar({ version: 'v3', auth });

/**
 * Finds the next meeting event in Google Calendar within the next week
 * @param {import('@googleapis/calendar').calendar_v3.Calendar} calendarClient - Google Calendar client
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
