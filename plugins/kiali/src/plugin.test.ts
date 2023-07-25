import { kialiPlugin } from './plugin';

describe('kiali', () => {
  it('should export plugin', () => {
    expect(kialiPlugin).toBeDefined();
  });
});
