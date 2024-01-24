import { ConfigReader } from '@backstage/config';

import { readKialiConfigs } from './config';

describe('Configuration', () => {
  it('should return KialiDetails object from configuration', async () => {
    const configuration = new ConfigReader({
      catalog: {
        providers: {
          kiali: {
            url: 'https://localhost:4000',
          },
        },
      },
    });
    const result = readKialiConfigs(configuration);
    expect(result).toStrictEqual({
      url: 'https://localhost:4000/',
      serviceAccountToken: undefined,
      skipTLSVerify: false,
      sessionTime: undefined,
      caData: undefined,
      caFile: undefined,
    });
  });

  it('should throw an error when url is not set', async () => {
    const configuration = new ConfigReader({
      catalog: {
        providers: {
          kiali: {
            skipTLSVerify: true,
          },
        },
      },
    });
    expect(() => readKialiConfigs(configuration)).toThrow(
      new Error(
        `Value must be specified in config at 'catalog.providers.kiali.url'`,
      ),
    );
  });

  it('should throw an error when url is not correct', async () => {
    const configuration = new ConfigReader({
      catalog: {
        providers: {
          kiali: {
            url: 'kiali',
          },
        },
      },
    });
    expect(() => readKialiConfigs(configuration)).toThrow(
      new Error(`"kiali" is not a valid url`),
    );
  });
});
