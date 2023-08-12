/**
 * Gets the user time zone
 *
 * @return The users time zone as a string or 'UTC' by default
 */
export function getUserTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
