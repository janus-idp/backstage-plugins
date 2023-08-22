import { getFileSize } from './get-file-size';

describe('getFileSize', () => {
  it('should return the correct file size', () => {
    const component = {
      assets: [
        {
          fileSize: 1,
        },
        {
          fileSize: 20,
        },
      ],
    };
    const rawAssets = [
      {
        schemaVersion: 2,
        mediaType: '',
        layers: [
          {
            size: 300,
            mediaType: '',
            digest: '',
          },
          {
            size: 4000,
            mediaType: '',
            digest: '',
          },
        ],
        config: {
          size: 50000,
          mediaType: '',
          digest: '',
        },
      },
      null,
    ];
    expect(getFileSize({ component, rawAssets })).toBe(54321);
  });
});
