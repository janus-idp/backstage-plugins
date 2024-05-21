import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ErrorLike } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

import { Request } from 'express';

import {
  ActorDetails,
  AuditErrorLogOptions,
  AuditLogDetails,
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
    try {
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

      return userEntityRef ?? serviceEntityRef;
    } catch {
      return undefined;
    }
  }
  async createAuditLogDetails(
    options: AuditLogDetailsOptions,
  ): Promise<AuditLogDetails> {
    const { eventName, stage, metadata, request, response, status } = options;

    const actorId = options.actorId || (await this.getActorId(request)) || null;

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

    let actor: ActorDetails = { actorId };
    if (request) {
      actor.ip = request.ip;
      actor.hostname = request.hostname;
      actor.userAgent = request.get('user-agent');
    }

    const auditLogCommonDetails = {
      actor,
      meta: metadata || {},
      request: auditRequest,
      isAuditLog: true as const,
      response,
      eventName,
      stage,
    };

    if (auditRequest) {
      auditLogCommonDetails.request = auditRequest;
    }
    if (response) {
      auditLogCommonDetails.response = response;
    }

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
    const auditLogDetails = await this.createAuditLogDetails({
      eventName: options.eventName,
      status: 'succeeded',
      stage: options.stage,
      actorId: options.actorId,
      request: options.request,
      response: options.response,
      metadata: options.metadata,
    });
    this.logger.info(options.message, auditLogDetails as JsonObject);
  }

  async auditErrorLog(options: AuditErrorLogOptions): Promise<void> {
    const auditLogDetails = await this.createAuditLogDetails({
      eventName: options.eventName,
      status: 'failed',
      stage: options.stage,
      errors: options.errors,
      actorId: options.actorId,
      request: options.request,
      response: options.response,
      metadata: options.metadata,
    });

    this.logger.error(options.message, auditLogDetails as JsonObject);
  }
}
