import { getVoidLogger } from '@backstage/backend-common';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';

import { DefaultAuditLogger } from './DefaultAuditLogger';

describe('DefaultAuditLogger', () => {
  const logger = getVoidLogger();

  const auditLogger = new DefaultAuditLogger({
    logger,
    authService: mockServices.auth({
      pluginId: 'scaffolder',
      disableDefaultAuthPolicy: false,
    }),
    httpAuthService: mockServices.httpAuth({
      pluginId: 'scaffolder',
      defaultCredentials: mockCredentials.user(),
    }),
  });

  it('Returns nothing if no request is provided to getActorId', async () => {
    const actor_id = auditLogger.getActorId();
    expect(actor_id).toBeUndefined();
  });
});
