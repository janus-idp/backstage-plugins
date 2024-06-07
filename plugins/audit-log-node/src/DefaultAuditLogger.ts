import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ErrorLike } from '@backstage/errors';
import { JsonObject, JsonValue } from '@backstage/types';

import { Request } from 'express';
import { cloneDeep } from 'lodash';

import {
  ActorDetails,
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
  async createAuditLogDetails<T extends JsonValue>(
    options: AuditLogDetailsOptions<T>,
  ): Promise<AuditLogDetails> {
    const { eventName, stage, metadata, request, response, status } = options;

    const actorId = options.actorId || (await this.getActorId(request)) || null;

    // Secrets in the body field should be redacted by the user before passing in the request object
    const auditRequest = request
      ? {
          method: request.method,
          url: request.originalUrl,
          params: cloneDeep(request.params),
          query: cloneDeep(request.query),
          body: cloneDeep(request.body),
        }
      : undefined;

    const actor: ActorDetails = { actorId };
    if (request) {
      actor.ip = request.ip;
      actor.hostname = request.hostname;
      actor.userAgent = request.get('user-agent');
    }

    const auditLogCommonDetails = {
      actor: cloneDeep(actor),
      meta: cloneDeep(metadata) || {},
      request: auditRequest,
      isAuditLog: true as const,
      response: cloneDeep(response),
      eventName,
      stage,
    };

    if (status === 'failed') {
      const errs = cloneDeep(options.errors) as ErrorLike[];
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
  async auditLog<T extends JsonValue>(
    options: AuditLogOptions<T>,
  ): Promise<void> {
    let auditLogDetails: AuditLogDetails;
    const logLevel = options.level || 'info';
    const auditLogCommonDetails = {
      eventName: options.eventName,
      stage: options.stage,
      actorId: options.actorId,
      request: options.request,
      response: options.response,
      metadata: options.metadata,
    };
    if (options.status === 'failed') {
      auditLogDetails = await this.createAuditLogDetails({
        ...auditLogCommonDetails,
        status: options.status,
        errors: options.errors,
      });
    } else {
      auditLogDetails = await this.createAuditLogDetails({
        ...auditLogCommonDetails,
        status: options.status,
      });
    }

    switch (logLevel) {
      case 'info':
        this.logger.info(options.message, auditLogDetails as JsonObject);
        return;
      case 'debug':
        this.logger.debug(options.message, auditLogDetails as JsonObject);
        return;
      case 'warn':
        this.logger.warn(options.message, auditLogDetails as JsonObject);
        return;
      case 'error':
        this.logger.error(options.message, auditLogDetails as JsonObject);
        return;
      default:
        throw new Error(`Log level of ${logLevel} is not supported`);
    }
  }
}
