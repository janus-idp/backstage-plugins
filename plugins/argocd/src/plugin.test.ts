import { argocdPlugin } from './plugin';

describe('argocd', () => {
  it('should export plugin', () => {
    expect(argocdPlugin).toBeDefined();
  });
});
