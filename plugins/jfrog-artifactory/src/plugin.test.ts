import { jfrogArtifactoryPlugin } from './plugin';

describe('artifactory', () => {
  it('should export plugin', () => {
    expect(jfrogArtifactoryPlugin).toBeDefined();
  });
});
