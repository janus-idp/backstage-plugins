const byteUnits = ['B', 'kB', 'MB', 'GB', 'TB'];

/**
 * Returns the given date as a formated Date.
 *
 * @param date - The given date in seconds
 * @return The date formatted to en-US locale, otherwise return 'N/A'
 */
export function formatDate(date: string | number): string {
  if (date === -1) {
    return 'N/A';
  }

  const adjustedDate = typeof date === 'number' ? date * 1000 : date;
  return new Date(adjustedDate).toLocaleString('en-US', {
    timeZone: getUserTimeZone(),
    timeStyle: 'short',
    dateStyle: 'medium',
  });
}

/**
 * Gets the user time zone
 *
 * @return The users time zone as a string or 'UTC' by default
 */
export function getUserTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * Calculcates the index of the closest unit of a given size in bytes.
 *
 * @param sizeInBytes - The given size in bytes
 * @return The calculated index
 */
function calculateUnit(sizeInBytes: number): number {
  return Math.floor(Math.log(sizeInBytes) / Math.log(1024));
}

/**
 * Returns a given size in bytes formated to the closeet to power of 1024
 *
 * @param sizeInBytes - The given size in bytes
 * @return Formated bytes in powers of 1024
 */
export function formatSize(sizeInBytes: number): string {
  if (!sizeInBytes) {
    // null or undefined
    return 'N/A';
  }

  const unitIndex = calculateUnit(sizeInBytes);
  return `${Number((sizeInBytes / Math.pow(1024, unitIndex)).toFixed(2))} ${
    byteUnits[unitIndex]
  }`;
}
