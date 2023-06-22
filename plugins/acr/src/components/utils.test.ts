import { formatDate } from './utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('formatDate should return formatted date', () => {
      const formatDateVal = formatDate('2023-06-30T05:03:17.8253401Z');
      expect(formatDateVal).toEqual('Jun 30, 2023, 5:03 AM');
    });

    it('formatDate should return formatted date for date', () => {
      const formatDateVal = formatDate(
        new Date('2023-06-30T05:03:17.8253401Z'),
      );
      expect(formatDateVal).toEqual('Jun 30, 2023, 5:03 AM');
    });

    it('formatDate should return N/A for invalid date', () => {
      const formatDateVal = formatDate(-1);
      expect(formatDateVal).toEqual('N/A');
    });

    it('formatDate should return Invalid Date for empty string', () => {
      const formatDateVal = formatDate('');
      expect(formatDateVal).toEqual('Invalid Date');
    });
  });
});
