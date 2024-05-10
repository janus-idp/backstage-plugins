import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ErrorLike } from '@backstage/errors';

import { Request } from 'express';

import {
  AuditErrorLogOptions,
  AuditLogDetailsOptions,
  AuditLogger,
  AuditLoggerOptions,
  AuditLogOptions,
} from './types';

export class DefaultAuditLogger implements AuditLogger {
  private readonly logger: LoggerService;
  private readonly authService: AuthService;
  private readonly httpAuthService: HttpAuthService;

  constructor(options: AuditLoggerOptions) {
    this.logger = options.logger;
    this.authService = options.authService;
    this.httpAuthService = options.httpAuthService;
  }

  async getActorId(request?: Request): Promise<string | undefined> {
    if (!(request && this.httpAuthService && this.authService)) {
      return undefined;
    }
    const credentials = await this.httpAuthService.credentials(request);

    const userEntityRef = this.authService.isPrincipal(credentials, 'user')
      ? credentials.principal.userEntityRef
      : undefined;

    const serviceEntityRef = this.authService.isPrincipal(
      credentials,
      'service',
    )
      ? credentials.principal.subject
      : undefined;

    return userEntityRef ?? serviceEntityRef ?? '';
  }
  async createAuditLogDetails(options: AuditLogDetailsOptions) {
    const { eventName, stage, metadata, actor_id, request, response, status } =
      options;

    const actorId = actor_id || (await this.getActorId(request));

    if (!actorId) {
      throw new Error('No actor id was provided for audit log');
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
  async auditLog(options: AuditLogOptions): Promise<void> {
    if (!(options.request && options.actor_id)) {
      throw new Error('No actor id was provided for audit log');
    }
    const auditLogDetails = await this.createAuditLogDetails({
      eventName: options.eventName,
      status: 'succeeded',
      stage: options.stage,
      actor_id: options.actor_id,
      request: options.request,
      response: options.response,
      metadata: options.metadata,
    });

    this.logger.info(options.message, auditLogDetails);
  }

  async auditErrorLog(options: AuditErrorLogOptions): Promise<void> {
    if (!(options.request && options.actor_id)) {
      throw new Error('No actor id was provided for audit log');
    }
    const auditLogDetails = await this.createAuditLogDetails({
      eventName: options.eventName,
      status: 'failed',
      stage: options.stage,
      errors: options.errors,
      actor_id: options.actor_id,
      request: options.request,
      response: options.response,
      metadata: options.metadata,
    });

    this.logger.error(options.message, auditLogDetails);
  }
}
