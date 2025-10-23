import ical from 'ical';

/**
 * Creates an ICAL instance from the input URL
 * @param {string} url
 */
const getEventsFromCalendar = async url => {
  const response = await fetch(url);
  const text = await response.text();

  return Object.values(ical.parseICS(text));
};

/**
 * Finds the next meeting event in any iCal feed for the current week
 * @param {import('./types').MeetingConfig} meetingConfig - Meeting configuration object
 * @returns {Promise<Date>} The date of the next meeting
 */
export const findNextMeetingDate = async ({ properties }) => {
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

  const allEvents = await getEventsFromCalendar(properties.ICAL_URL);

  const filteredEvents = allEvents.filter(
    event =>
      // The event must be recurring
      event.rrule &&
      // The event must match our filter
      (event.summary || event.description)?.includes(properties.CALENDAR_FILTER)
  );

  for (const event of filteredEvents) {
    // Get all recurrences in our timeframe
    event.rrule.options.tzid = event.tzid;
    const duringOurTimeframe = event.rrule.between(weekStart, weekEnd);

    if (duringOurTimeframe.length > 0) {
      return duringOurTimeframe[0];
    }
  }

  throw new Error(
    `No meeting found for ${properties.GROUP_NAME || 'this group'} ` +
      `in the current week (${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}). ` +
      `This is expected for bi-weekly meetings or meetings that don't occur every week.`
  );
};
