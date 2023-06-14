import { VulnerabilitySeverity } from '../types';
import { formatDate, formatSize, SEVERITY_COLORS } from './utils';

describe('SEVERITY_COLORS', () => {
  it('should return the correct hex color code', () => {
    const severity = VulnerabilitySeverity.Critical;

    const result = SEVERITY_COLORS[severity];

    expect(result).toBe('#7D1007');
  });

  it('should return the default color code if the severity is unknown', () => {
    const result = SEVERITY_COLORS[VulnerabilitySeverity.Unknown];

    expect(result).toBe('#8A8D90');
  });
});

describe('formatSize', () => {
  it('should correctly return if no size is supplied', () => {
    const size = formatSize(0);

    expect(size).toBe('N/A');
  });

  it('should return the formated size correctly with the corrent unit', () => {
    const bytes = 18961918;
    const mebibytes = 18.08;
    const size = formatSize(bytes);

    expect(size).toBe(`${mebibytes} MB`);
  });

  it('should return the original size with added unit if the original size is less then 1024', () => {
    const bytes = 1010;
    const size = formatSize(bytes);

    expect(size).toBe(`${bytes} B`);
  });
});

describe('formatDate', () => {
  it('should correctly return if date is -1', () => {
    const date = formatDate(-1);

    expect(date).toBe('N/A');
  });

  it('should correctly format a date', () => {
    const date = formatDate('Tue, 14 Feb 2023 17:15:55 +0100').normalize(
      'NFKC',
    );

    expect(date).toBe('Feb 14, 2023, 4:15 PM');
  });

  it('should correctly format a date when its a number', () => {
    const date = formatDate(1678890069).normalize('NFKC');

    expect(date).toBe('Mar 15, 2023, 2:21 PM');
  });
});
