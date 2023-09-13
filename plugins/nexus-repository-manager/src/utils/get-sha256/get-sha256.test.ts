import { getSha256 } from './get-sha256';

describe('getSha256', () => {
  it('should return the correct sha256', () => {
    const asset = {
      checksum: {
        sha256: '12345',
      },
    };
    expect(getSha256(asset)).toBe('12345');
  });

  it('should return N/A if asset is undefined', () => {
    expect(getSha256(undefined)).toBe('N/A');
  });

  it('should return N/A if checksum is undefined', () => {
    const asset = {};
    expect(getSha256(asset)).toBe('N/A');
  });

  it('should return N/A if checksum is not sha256', () => {
    const asset = {
      checksum: {
        md5: '12345',
      },
    };
    expect(getSha256(asset)).toBe('N/A');
  });
});
