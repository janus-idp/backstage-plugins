const byteUnits = ['B', 'kB', 'MB', 'GB', 'TB'];

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

function calculateUnit(sizeInBytes: number): number {
  return Math.floor(Math.log(sizeInBytes) / Math.log(1024));
}

export function formatSize(sizeInBytes: number): string {
  if (!sizeInBytes) {
    // null or undefined
    return 'N/A';
  }

  const unitIndex = calculateUnit(sizeInBytes);
  return `${Number((sizeInBytes / Math.pow(1024, unitIndex)).toFixed(2))} ${byteUnits[unitIndex]}`;
}
