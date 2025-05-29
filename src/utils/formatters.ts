import pluralize from 'pluralize';

/**
 * Formats a duration in minutes into a human-readable string.
 * Examples:
 * - formatTime(1) => "1 min"
 * - formatTime(30) => "30 mins"
 * - formatTime(60) => "1 hour"
 * - formatTime(90) => "1 hour 30 mins"
 * - formatTime(120) => "2 hours"
 * - formatTime(135) => "2 hours 15 mins"
 */
export const formatTime = (minutes: number): string => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return 'Invalid input'; // Or throw an error, or return a default like '0 mins'
  }

  if (minutes === 0) {
    return '0 mins';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${pluralize('hour', hours)}`);
  }

  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} ${pluralize('min', remainingMinutes)}`);
  }

  return parts.join(' ') || '0 mins'; // Fallback for edge case if both are zero (already handled)
};
