import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ErrorLike } from '@backstage/errors';
import { JsonValue } from '@backstage/types';

import { Request } from 'express';

export type ActorDetails = {
  actorId: string | null;
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
export type AuditLogSuccessStatus = { status: 'succeeded' };
export type AuditLogFailureStatus = {
  status: 'failed';
  errors: ErrorLike[];
};
export type AuditLogUnknownFailureStatus = {
  status: 'failed';
  errors: unknown[];
};

export type AuditLogStatus = AuditLogSuccessStatus | AuditLogFailureStatus;

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

export type AuditLogDetailsOptions<T extends JsonValue> = {
  eventName: string;
  stage: string;
  metadata?: T;
  response?: AuditResponse;
  actorId?: string;
  request?: Request;
} & (AuditLogSuccessStatus | AuditLogUnknownFailureStatus);

export type AuditLogOptions<T extends JsonValue> = {
  eventName: string;
  message: string;
  stage: string;
  level?: 'info' | 'debug' | 'warn' | 'error';
  actorId?: string;
  metadata?: T;
  response?: AuditResponse;
  request?: Request;
} & (AuditLogSuccessStatus | AuditLogUnknownFailureStatus);

export type AuditLoggerOptions = {
  logger: LoggerService;
  authService: AuthService;
  httpAuthService: HttpAuthService;
};

export interface AuditLogger {
  /**
   * Processes an express request and obtains the actorId from it. Returns undefined if actorId is not obtainable.
   *
   * @public
   */
  getActorId(request?: Request): Promise<string | undefined>;

  /**
   * Generates the audit log details to place in the metadata argument of the logger
   *
   * Secrets in the metadata field and request body, params and query field should be redacted by the user before passing in the request object
   * @public
   */
  createAuditLogDetails<T extends JsonValue>(
    options: AuditLogDetailsOptions<T>,
  ): Promise<AuditLogDetails>;

  /**
   * Generates an Audit Log and logs it at the level passed by the user.
   * Supports `info`, `debug`, `warn` or `error` level. Defaults to `info` if no level is passed.
   *
   * Secrets in the metadata field and request body, params and query field should be redacted by the user before passing in the request object
   * @public
   */
  auditLog<T extends JsonValue>(options: AuditLogOptions<T>): Promise<void>;
}
