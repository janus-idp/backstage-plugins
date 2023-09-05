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
        schemaVersion: 2 as const,
        mediaType:
          'application/vnd.docker.distribution.manifest.v2+json' as const,
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
  it('should return the correct file size for manifest 2, schema 1', () => {
    const component = {
      assets: [
        {
          fileSize: 111,
        },
      ],
    };
    const rawAssets = [
      {
        schemaVersion: 1 as const,
        name: '',
        tag: '',
        architecture: '',
        fsLayers: [
          {
            blobSum: '',
          },
        ],
        history: [
          {
            v1Compatibility: '',
          },
        ],
      },
      null,
    ];
    expect(getFileSize({ component, rawAssets })).toBe(111);
  });
});
