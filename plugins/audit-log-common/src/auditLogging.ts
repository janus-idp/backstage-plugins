import { AuditLogDetails, AuditLogOptions } from './types';

/**
 * Generates the audit log details to place in the metadata argument of the logger
 *
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

  // FIXME: Need to redact scaffolder secrets in the request.body
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
    meta: metadata,
    request: auditRequest,
    isAuditLog: true as const,
    response,
    eventName,
    stage,
  };

  if (status === 'failed') {
    const err = {
      name: options.error.name,
      message: options.error.message,
      stack: options.error.message,
    };
    return {
      ...auditLogCommonDetails,
      status,
      error: err,
    };
  } else {
    return {
      ...auditLogCommonDetails,
      status,
    };
  }
}
