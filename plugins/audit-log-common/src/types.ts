import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ErrorLike } from '@backstage/errors';
import { JsonValue } from '@backstage/types';

import { Request } from 'express';

export type ActorDetails = {
  actorId: string;
  ip?: string;
  hostname?: string;
  userAgent?: string;
};

export type AuditRequest = {
  body: any;
  url: string;
  method: string;
  params?: any;
  query?: any;
};

export type AuditResponse = {
  status: number;
  body?: any;
};

export type AuditLogStatus =
  | {
      status: 'failed';
      errors: ErrorLike[];
    }
  | { status: 'succeeded' };

/**
 * Common fields of an audit log. Note: timestamp and pluginId are automatically added at log creation.
 *
 * @public
 */
export type AuditLogDetails = {
  actor: ActorDetails;
  eventName: string;
  stage: string;
  request?: AuditRequest;
  response?: AuditResponse;
  meta: JsonValue;
  isAuditLog: true;
} & AuditLogStatus;

export type AuditActorOptions =
  | {
      actor_id: string;
      request?: Request;
    }
  | {
      actor_id?: string;
      request: Request;
    };

export type AuditLogDetailsOptions = {
  eventName: string;
  stage: string;
  metadata?: JsonValue;
  response?: AuditResponse;
} & AuditActorOptions &
  ({ status: 'succeeded' } | { status: 'failed'; errors: unknown[] });

export type AuditLogOptions = {
  eventName: string;
  message: string;
  stage: string;
  metadata?: JsonValue;
  response?: AuditResponse;
} & AuditActorOptions;

export type AuditErrorLogOptions = AuditLogOptions & { errors: unknown[] };

export type AuditLoggerOptions = {
  logger: LoggerService;
  authService: AuthService;
  httpAuthService: HttpAuthService;
};

export interface AuditLogger {
  /**
   *
   * Processes an express request and obtains the actorId from it. Returns undefined if actorId is not obtainable.
   */
  getActorId(request?: Request): Promise<string | undefined>;

  /**
   * Generates the audit log details to place in the metadata argument of the logger
   *
   * Secrets in the request body field should be redacted by the user before passing in the request object
   * @public
   */
  createAuditLogDetails(
    options: AuditLogDetailsOptions,
  ): Promise<AuditLogDetails>;

  /**
   *
   * Generates an Audit Log and logs it at the info level
   */
  auditLog(options: AuditLogOptions): Promise<void>;

  /**
   *
   * Generates an Audit Log for an error and logs it at the error level
   */
  auditErrorLog(options: AuditErrorLogOptions): Promise<void>;
}
