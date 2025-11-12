import ical from 'ical';

/**
 * Creates an ICAL instance from the input URL
 * @param {string} url
 */
export const getEventsFromCalendar = async url => {
  const response = await fetch(url);
  const text = await response.text();

  return Object.values(ical.parseICS(text));
};

/**
 * @param {Date} start
 */
export const getWeekBounds = (start = new Date()) => {
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return [start, end];
};

/**
 * Finds the next meeting event in any iCal feed for the current week
 * @param {ical.CalendarComponent[]} allEvents - The events
 * @param {import('./types').MeetingConfig} meetingConfig - Meeting configuration object
 * @returns {Promise<Date|null>} The date of the next meeting, or null if no meeting is found
 */
export const findNextMeetingDate = async (allEvents, { properties }) => {
  const [weekStart, weekEnd] = getWeekBounds();

  const filteredEvents = allEvents.filter(
    event =>
      // The event must be recurring
      event.rrule &&
      // The event must match our filter
      (event.summary || event.description)?.includes(properties.CALENDAR_FILTER)
  );

  for (const event of filteredEvents) {
    // Get all recurrences in our timeframe
    event.rrule.options.tzid = event.start?.tz;
    const duringOurTimeframe = event.rrule.between(weekStart, weekEnd);

    if (duringOurTimeframe.length > 0) {
      return duringOurTimeframe[0];
    }
  }

  return null;
};
