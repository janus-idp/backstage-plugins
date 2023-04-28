export function formatDate(date: string | number | Date) {
  if (date === -1) {
    return 'N/A';
  }

  const adjustedDate = typeof date === 'number' ? date * 1000 : date;
  return new Date(adjustedDate).toLocaleString('en-US', {
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeStyle: 'short',
    dateStyle: 'medium',
  });
}