import { RELEVANT_TIMEZONES } from '../constants.mjs';

/**
 * Generic datetime formatter that accepts DateTimeFormat options
 * @param {Date} date - The date to format
 * @param {Intl.DateTimeFormatOptions} options - DateTimeFormat options
 * @returns {string} Formatted date/time string
 */
export const formatDateTime = (date, options = {}) => {
  const formatter = new Intl.DateTimeFormat('en-US', options);

  return formatter.format(date);
};

/**
 * Formats a date to different timezones for the meeting schedule
 * @param {Date} meetingDate - The meeting date
 * @returns {Object} Object with formatted times for different timezones
 */
export const formatTimezones = meetingDate => ({
  utc: formatDateTime(meetingDate, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }),
  timezones: RELEVANT_TIMEZONES.map(({ label, tz }) => ({
    label,
    time: formatDateTime(meetingDate, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }),
  })),
});
