import { getCurrentTimestamp } from './getCurrentTimestamp';

describe('getCurrentTimestamp', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return date and time', async () => {
    const dateObj = new Date();
    dateObj.setDate(12);
    dateObj.setMonth(4);
    dateObj.setFullYear(2021);
    dateObj.setHours(7);
    dateObj.setMinutes(3);
    dateObj.setSeconds(18);
    let dateAndTime = getCurrentTimestamp(dateObj);
    expect(dateAndTime).toBe('5/12/2021, 07:03:18 AM');

    dateObj.setHours(14);
    dateAndTime = getCurrentTimestamp(dateObj);
    expect(dateAndTime).toBe('5/12/2021, 02:03:18 PM');

    dateObj.setMinutes(20);
    dateAndTime = getCurrentTimestamp(dateObj);
    expect(dateAndTime).toBe('5/12/2021, 02:20:18 PM');
  });
});
