import { mockServices } from '@backstage/backend-test-utils';

import supported from '../kiali_supported.json';
import { KIALI_CORE_VERSION, KialiApiImpl } from './KialiAPIConnector';

const logger = mockServices.logger.mock();

const kialiApi = new KialiApiImpl({
  logger,
  kiali: {
    url: 'https://localhost:4000',
    urlExternal: 'https://localhost:4000',
  },
});

describe('kiali Api Connector', () => {
  describe('Validate suported version', () => {
    it('Plugin support the version', () => {
      const versionsToTest = ['v1.73', 'v1.73.6'];
      versionsToTest.forEach(version => {
        const support = kialiApi.supportedVersion(version);
        expect(support).toBeUndefined();
      });
    });

    it('Plugin not support version', () => {
      const versionToTest = 'v1.70';
      const support = kialiApi.supportedVersion(versionToTest);
      const kialiSupported = supported[KIALI_CORE_VERSION];
      expect(support).toBe(
        `Kiali version supported is ${kialiSupported}, we found version ${versionToTest}`,
      );
    });
  });
});
