import { ErrorLike } from '@backstage/errors';

import { AuditLogDetails, AuditLogOptions } from './types';

/**
 * Generates the audit log details to place in the metadata argument of the logger
 *
 * Secrets in the body field should be redacted by the user before passing in the request object
 * @public
 */
export async function createAuditLogDetails(
  options: AuditLogOptions,
): Promise<AuditLogDetails> {
  const {
    eventName,
    stage,
    metadata,
    actor_id,
    authServices,
    request,
    response,
    status,
  } = options;

  let actorId = '';

  if (authServices && request) {
    const credentials = await authServices.httpAuth.credentials(request);

    const userEntityRef = authServices.auth.isPrincipal(credentials, 'user')
      ? credentials.principal.userEntityRef
      : undefined;

    const serviceEntityRef = authServices.auth.isPrincipal(
      credentials,
      'service',
    )
      ? credentials.principal.subject
      : undefined;

    actorId = userEntityRef ?? serviceEntityRef ?? '';
  }

  if (actor_id) {
    actorId = actor_id;
  } else if (!actorId && !actor_id) {
    throw new Error('No actor_id provided for audit log');
  }

  // Secrets in the body field should be redacted by the user before passing in the request object
  const auditRequest = request
    ? {
        method: request.method,
        url: request.originalUrl,
        params: request.params,
        query: request.query,
        body: request.body,
      }
    : undefined;

  const auditLogCommonDetails = {
    actor: {
      actorId,
      ip: request?.ip,
      hostname: request?.hostname,
      userAgent: request?.get('user-agent'),
    },
    meta: metadata || {},
    request: auditRequest,
    isAuditLog: true as const,
    response,
    eventName,
    stage,
  };

  if (status === 'failed') {
    const errs = options.errors as ErrorLike[];
    return {
      ...auditLogCommonDetails,
      status,
      errors: errs.map(err => {
        return {
          name: err.name,
          message: err.message,
          stack: err.stack,
        };
      }),
    };
  }

  return {
    ...auditLogCommonDetails,
    status,
  };
}
