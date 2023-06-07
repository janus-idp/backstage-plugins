import { formatDate, formatSize } from './utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should correctly format date', () => {
      const date = new Date('2023-06-05T00:00:00Z');
      expect(formatDate(date)).toBe(
        date.toLocaleString('en-US', {
          timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
          timeStyle: 'short',
          dateStyle: 'medium',
        }),
      );
    });

    it('should correctly format unix timestamp', () => {
      const timestamp = 1678262400; // equivalent to '2023-06-05T00:00:00Z'
      const date = new Date(timestamp * 1000);
      expect(formatDate(timestamp)).toBe(
        date.toLocaleString('en-US', {
          timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
          timeStyle: 'short',
          dateStyle: 'medium',
        }),
      );
    });

    it('should return "N/A" when date is -1', () => {
      expect(formatDate(-1)).toBe('N/A');
    });
  });
});

describe('formatSize', () => {
  it('returns "N/A" when size is 0', () => {
    expect(formatSize(0)).toBe('N/A');
  });

  it('should correctly format sizes', () => {
    expect(formatSize(1024)).toBe('1 kB');
    expect(formatSize(1048576)).toBe('1 MB');
    expect(formatSize(1073741824)).toBe('1 GB');
    expect(formatSize(1099511627776)).toBe('1 TB');
  });
});
