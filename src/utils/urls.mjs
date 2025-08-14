import { formatDateTime } from './dates.mjs';

/**
 * Generates TimeAndDate.com world clock link
 * @param {Date} meetingDate - The meeting date
 * @param {string} groupName - The meeting group name
 * @returns {string} TimeAndDate.com URL
 */
export const generateTimeAndDateLink = (meetingDate, groupName) => {
  const encodedGroupName = encodeURIComponent(groupName);

  const utcShort = meetingDate.toISOString().split('T')[0];

  const isoDateTime = meetingDate
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0];

  return `https://www.timeanddate.com/worldclock/fixedtime.html?msg=Node.js+Foundation+${encodedGroupName}+Meeting+${utcShort}&iso=${isoDateTime}`;
};

/**
 * Generates WolframAlpha timezone conversion link
 * @param {Date} meetingDate - The meeting date
 * @returns {string} WolframAlpha URL
 */
export const generateWolframAlphaLink = meetingDate => {
  const utcTime = formatDateTime(meetingDate, {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const utcDate = formatDateTime(meetingDate, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `https://www.wolframalpha.com/input/?i=${encodeURIComponent(utcTime)}+UTC%2C+${encodeURIComponent(utcDate)}+in+local+time`;
};
