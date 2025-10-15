import ical from 'ical';
/**
 * Finds the next meeting event in Google Calendar for the current week
 * @param {import('./types').MeetingConfig} meetingConfig - Meeting configuration object
 * @returns {Promise<Date>} Calendar event object
 */
export const findNextMeetingDate = async ({
  properties: { ICAL_URL, CALENDAR_FILTER, GROUP_NAME },
}) => {
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

  const ics = await fetch(ICAL_URL).then(r => r.text());

  const events = Object.values(ical.parseICS(ics)).filter(event =>
    (event.summary || event.description)?.includes(CALENDAR_FILTER)
  );

  for (const event of events) {
    const duringOurTimeframe = event.rrule?.between(weekStart, weekEnd);
    if (duringOurTimeframe.length > 0) {
      return duringOurTimeframe[0];
    }
  }

  throw new Error(
    `No meeting found for ${GROUP_NAME || 'this group'} ` +
      `in the current week (${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}). ` +
      `This is expected for bi-weekly meetings or meetings that don't occur every week.`
  );
};
