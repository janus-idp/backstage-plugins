import { bulkImportPlugin } from './plugin';

describe('bulk-import', () => {
  it('should export plugin', () => {
    expect(bulkImportPlugin).toBeDefined();
  });
});
