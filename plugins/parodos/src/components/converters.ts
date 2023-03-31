import { DateTime } from 'luxon';

export const getHumanReadableDate = (date: Date): string => {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_SHORT);
};
