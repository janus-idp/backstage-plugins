import { formatDate } from './format-date';

describe('formatDate', () => {
  it('should return N/A if date is not defined', () => {
    expect(formatDate(undefined)).toEqual('N/A');
  });

  it('should format date', () => {
    expect(formatDate('2020-01-01T00:00:00.000Z')).toEqual(
      'Jan 1, 2020, 12:00 AM',
    );
  });
});
