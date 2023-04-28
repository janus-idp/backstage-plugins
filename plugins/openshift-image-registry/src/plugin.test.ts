import { openshiftImageRegistryPlugin } from './plugin';

describe('openshift-image-registry', () => {
  it('should export plugin', () => {
    expect(openshiftImageRegistryPlugin).toBeDefined();
  });
});
