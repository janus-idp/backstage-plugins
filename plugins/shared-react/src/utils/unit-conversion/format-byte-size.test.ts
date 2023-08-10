import { formatByteSize } from './format-byte-size';

describe('formatByteSize', () => {
  it('should return N/A if sizeInBytes is not defined', () => {
    expect(formatByteSize(undefined)).toEqual('N/A');
  });

  it('should return N/A if sizeInBytes is 0', () => {
    expect(formatByteSize(0)).toEqual('N/A');
  });

  it('should format sizeInBytes', () => {
    expect(formatByteSize(1)).toEqual('1 B');
    expect(formatByteSize(1_000)).toEqual('1 kB');
    expect(formatByteSize(1_000_000)).toEqual('1 MB');
    expect(formatByteSize(1_000_000_000)).toEqual('1 GB');
    expect(formatByteSize(1_000_000_000_000)).toEqual('1 TB');
    expect(formatByteSize(1_000_000_000_000_000)).toEqual('1 PB');
    expect(formatByteSize(1_000_000_000_000_000_000)).toEqual('1 EB');
    expect(formatByteSize(1_000_000_000_000_000_000_000)).toEqual('1 ZB');
    expect(formatByteSize(1_000_000_000_000_000_000_000_000)).toEqual('1 YB');
  });
});
