import { AxiosError } from 'axios';
import { createLogger, transports } from 'winston';

import { AuthStrategy } from './Auth';
import { KialiFetcher, ValidationCategory } from './fetch';

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('kiali Fetch', () => {
  describe('Kiali configuration validation', () => {
    describe(`${AuthStrategy.anonymous} strategy`, () => {
      it('should get a true', async () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.anonymous,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
        expect(result.message).toBeUndefined();
        expect(result.missingAttributes).toBeUndefined();
        expect(result.helper).toBeUndefined();
      });
    });
    describe(`${AuthStrategy.token} strategy`, () => {
      it('should get a false when `serviceAccountToken` is missed', async () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeFalsy();
        expect(result.category).toBe(ValidationCategory.configuration);
        expect(result.message).toBeDefined();
        expect(result.message).toStrictEqual(
          "Attribute 'serviceAccountToken' is not in the backstage configuration",
        );
        expect(result.missingAttributes).toBeDefined();
        expect(result.missingAttributes[0]).toStrictEqual(
          'serviceAccountToken',
        );
      });

      it('should get a true when `serviceAccountToken` is set', async () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000', serviceAccountToken: '<token>' },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
        expect(result.message).toBeUndefined();
        expect(result.missingAttributes).toBeUndefined();
        expect(result.helper).toBeUndefined();
      });
    });

    describe(`Not ${AuthStrategy.openid} strategy supported`, () => {
      it('should get a true', async () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.openid,
          sessionInfo: {},
        });

        expect(result.verify).toBeFalsy();
        expect(result.category).toBe(ValidationCategory.configuration);
        expect(result.message).toBeDefined();
        expect(result.message).toStrictEqual(
          `Strategy ${AuthStrategy.openid} is not supported in Kiali backstage plugin yet`,
        );
      });
    });
  });

  describe('Read Ca files', () => {
    describe('bufferFromFileOrString', () => {
      it('No file or data passed', () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString();

        expect(result).toBeNull();
      });

      it('Read from file', () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString(
          './__fixtures__/ca_example.pem',
        );

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Buffer);
      });

      it('Read from data', () => {
        const kialiFetch = new KialiFetcher(
          { url: 'https://localhost:4000' },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString(
          undefined,
          './__fixtures__/ca_example.pem',
        );

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Buffer);
      });
    });
  });

  describe('Return networking error in checkSession', () => {
    it('Respond with verify category to network', async () => {
      const kialiFetch = new KialiFetcher(
        { url: 'https://localhost:4000' },
        logger,
      );

      jest.mock('./fetch', () => ({
        getAuthInfo: Promise.reject({}),
      }));
      const validations = await kialiFetch.checkSession();
      expect(validations).toBeDefined();
      expect(validations.title).toBe('Error reaching Kiali');
      expect(validations.category).toBe(ValidationCategory.networking);
    });
  });

  describe('Handle Unsuccessful Response', () => {
    it('Respond with a readable message with endpoint', () => {
      const kialiFetch = new KialiFetcher(
        { url: 'https://localhost:4000' },
        logger,
      );
      const message = 'Error server message';
      const code = '404';
      const endpoint = '/api/status';
      const axiosError = new AxiosError(message, code);
      const result = (kialiFetch as any).handleUnsuccessfulResponse(
        axiosError,
        endpoint,
      );

      expect(result).toStrictEqual(
        `[${code}] Fetching when fetching "${endpoint}" in "Kiali"; body=[${message}]`,
      );
    });

    it('Respond with a readable message without endpoint', () => {
      const kialiFetch = new KialiFetcher(
        { url: 'https://localhost:4000' },
        logger,
      );
      const message = 'Error server message';
      const code = '404';
      const axiosError = new AxiosError(message, code);
      const result = (kialiFetch as any).handleUnsuccessfulResponse(axiosError);

      expect(result).toStrictEqual(`[${code}] Fetching  body=[${message}]`);
    });
  });
});
