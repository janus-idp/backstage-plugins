// import { getVoidLogger } from '@backstage/backend-common';
import { PolicyBuilder } from './policy-builder';

describe('policyBuilder', () => {
  beforeAll(async () => {});

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('PolicyBuilder', () => {
    it('should build', () => {
      expect(PolicyBuilder).toBeTruthy();
      // PolicyBuilder.build({
      //     config:
      //     logger: getVoidLogger(),
      //     discovery: env.discovery,
      //     identity: env.identity,
      //   }
      // )
    });
  });
});
