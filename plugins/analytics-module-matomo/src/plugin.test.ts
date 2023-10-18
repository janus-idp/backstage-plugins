import { analyticsModuleMatomoPlugin } from './plugin';

describe('matomo', () => {
  it('should export plugin', () => {
    expect(analyticsModuleMatomoPlugin).toBeDefined();
  });
});
