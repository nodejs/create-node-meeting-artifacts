import { calendar } from '@googleapis/calendar';

/**
 * Creates an authenticated Google Calendar client using API Key
 * @param {import('./types.d.ts').GoogleConfig} gConfig - Google configuration object
 * @returns {CalendarClient} Authenticated Google Calendar client
 */
export const createCalendarClient = ({ apiKey: auth }) =>
  calendar({ version: 'v3', auth });

/**
 * Finds the next meeting event in Google Calendar for the current week
 * @param {import('@googleapis/calendar').calendar_v3.Calendar} calendarClient - Google Calendar client
 * @param {import('./types.d.ts').MeetingConfig} meetingConfig - Meeting configuration object
 * @returns {Promise<CalendarEvent>} Calendar event object
 */
export const findNextMeetingEvent = async (
  calendarClient,
  { meeting: { calendar } }
) => {
  const now = new Date();

  // Calculate the start of the current week (Saturday 00:00:00 UTC)
  // This handles the scenario where we want a full week from Saturday to Friday
  const daysSinceStartOfWeek = (now.getUTCDay() + 1) % 7; // Saturday = 0, Sunday = 1, ..., Friday = 6
  const weekStart = new Date(now);

  weekStart.setUTCDate(now.getUTCDate() - daysSinceStartOfWeek);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Calculate the end of the week (Friday 23:59:59 UTC)
  const weekEnd = new Date(weekStart);

  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  // Search for events in the specified calendar using the filter text
  const response = await calendarClient.events.list({
    calendarId: `${calendar.id}@group.calendar.google.com`,
    timeMin: weekStart.toISOString(),
    timeMax: weekEnd.toISOString(),
    singleEvents: true,
    // Replace spaces with dots for Google Calendar search compatibility
    q: calendar.filter.replace(/"/g, '').replace(/ /g, '.'),
  });

  // Ensure we found at least one event
  if (!response.data.items || response.data.items.length === 0) {
    throw new Error(
      `No meeting found for ${calendar.filter} ` +
        `in the current week (${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}). ` +
        `This is expected for bi-weekly meetings or meetings that don't occur every week.`
    );
  }

  // Return the first (next) event found
  return response.data.items[0];
};
