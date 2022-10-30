import { rhacmPlugin } from './plugin';

describe('rhacm', () => {
  it('should export plugin', () => {
    expect(rhacmPlugin).toBeDefined();
  });
});
