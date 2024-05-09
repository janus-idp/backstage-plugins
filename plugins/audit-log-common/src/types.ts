import { AuthService, HttpAuthService } from '@backstage/backend-plugin-api';

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
      errors: {
        name: string;
        message: string;
        stack?: string;
      }[];
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
  meta: Record<PropertyKey, unknown>;
  isAuditLog: true;
} & AuditLogStatus;

/**
 * Used to obtain the user entityRef
 *
 * @public
 */
export type AuditAuthServices = {
  auth: AuthService;
  httpAuth: HttpAuthService;
};

export type AuditActorOptions =
  | {
      actor_id: string;
      request?: Request;
      authServices?: AuditAuthServices;
    }
  | {
      actor_id?: string;
      request: Request;
      authServices: AuditAuthServices;
    };

export type AuditLogOptions = {
  eventName: string;
  stage: string;
  metadata?: Record<PropertyKey, unknown>;
  response?: AuditResponse;
} & AuditActorOptions &
  ({ status: 'succeeded' } | { status: 'failed'; errors: unknown[] });
