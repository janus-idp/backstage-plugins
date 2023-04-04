import { DateTime } from 'luxon';

export const getHumanReadableDate = (date: Date | string): string => {
  const dateObject: Date = typeof date === 'string' ? new Date(date) : date;
  return DateTime.fromJSDate(dateObject).toLocaleString(
    DateTime.DATETIME_SHORT,
  );
};
