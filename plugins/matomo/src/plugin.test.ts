import { matomoPlugin } from './plugin';

describe('matomo', () => {
  it('should export plugin', () => {
    expect(matomoPlugin).toBeDefined();
  });
});
