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
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  // One week from today
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

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
    const duringOurTimeframe = event.rrule.between(start, end);

    if (duringOurTimeframe.length > 0) {
      return duringOurTimeframe[0];
    }
  }

  console.error(
    `No meeting found for ${properties.GROUP_NAME || 'this group'} ` +
      `in the next week (${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}). ` +
      `This is expected for bi-weekly meetings or meetings that don't occur every week.`
  );
};
