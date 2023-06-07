import { jfrogArtifactoryPlugin } from './plugin';

describe('jfrog artifactory', () => {
  it('should export plugin', () => {
    expect(jfrogArtifactoryPlugin).toBeDefined();
  });
});
