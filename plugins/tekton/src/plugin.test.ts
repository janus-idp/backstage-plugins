import { tektonPlugin } from './plugin';

describe('tekton', () => {
  it('should export plugin', () => {
    expect(tektonPlugin).toBeDefined();
  });
});
