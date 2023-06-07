import { topologyPlugin } from './plugin';

describe('topology', () => {
  it('should export plugin', () => {
    expect(topologyPlugin).toBeDefined();
  });
});
