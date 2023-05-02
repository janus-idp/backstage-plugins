export function getUserTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

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
