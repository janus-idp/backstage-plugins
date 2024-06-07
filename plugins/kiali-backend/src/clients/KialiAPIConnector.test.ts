import { createLogger, transports } from 'winston';

import supported from '../kiali_supported.json';
import { KIALI_CORE_VERSION, KialiApiImpl } from './KialiAPIConnector';

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

const kialiApi = new KialiApiImpl({
  logger: logger,
  kiali: { url: 'https://localhost:4000' },
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
