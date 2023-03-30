import { DateTime } from 'luxon';

export const getHumanReadableDate = (isoTime: string): string => {
  return DateTime.fromISO(isoTime).toLocaleString(DateTime.DATETIME_MED);
};
