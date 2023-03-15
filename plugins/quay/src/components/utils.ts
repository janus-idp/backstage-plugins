import { VulnerabilitySeverity } from '../types';

const byteUnits = ['B', 'kB', 'MB', 'GB', 'TB'];

export const SEVERITY_COLORS = new Proxy(
  new Map([
    [VulnerabilitySeverity.Critical, '#7D1007'],
    [VulnerabilitySeverity.High, '#C9190B'],
    [VulnerabilitySeverity.Medium, '#EC7A08'],
    [VulnerabilitySeverity.Low, '#F0AB00'],
    [VulnerabilitySeverity.None, '#3E8635'],
  ]) as any,
  {
    get: (o: Map<VulnerabilitySeverity, string>, k: VulnerabilitySeverity) =>
      o.has(k) ? o.get(k) : '#8A8D90',
  },
);

export function formatDate(date: string | number): string {
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

export function formatSize(sizeInBytes: number): string {
  if (!sizeInBytes) {
    // null or undefined
    return 'N/A';
  }

  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${Number((sizeInBytes / Math.pow(1024, i)).toFixed(2))} ${
    byteUnits[i]
  }`;
}
