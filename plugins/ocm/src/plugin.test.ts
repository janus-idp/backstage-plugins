import { OcmApiClient } from './api';
import { ocmPlugin } from './plugin';

describe('ocm', () => {
  it('should export plugin', () => {
    expect(ocmPlugin).toBeDefined();
  });

  it('should have the OCM api', () => {
    const apiFactories = Array.from(ocmPlugin.getApis());
    expect(apiFactories.length).toBe(1);
    expect(apiFactories[0].factory({})).toBeInstanceOf(OcmApiClient);
  });
});
