import { getTimeInMsBetweenRetries } from './helpers';

describe('getTimeInMsBetweenRetries', () => {
  it('should return 0 for retry 0', () => {
    expect(getTimeInMsBetweenRetries(0)).toBe(0);
  });

  it('should return more then 0 for the next retries', () => {
    expect(getTimeInMsBetweenRetries(1)).toBeGreaterThan(0);
    expect(getTimeInMsBetweenRetries(2)).toBeGreaterThan(0);
  });

  it('should return not go above 5 seconds', () => {
    expect(getTimeInMsBetweenRetries(9)).toBe(3000);
    expect(getTimeInMsBetweenRetries(10)).toBe(5000);
    expect(getTimeInMsBetweenRetries(11)).toBe(5000);
    expect(getTimeInMsBetweenRetries(100)).toBe(5000);
  });
});
