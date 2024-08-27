/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NotAllowedError, NotFoundError } from '@backstage/errors';

import express from 'express';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

const EVENT_PREFIX = 'BulkImport';
const UNKNOWN_ENDPOINT_EVENT = `${EVENT_PREFIX}UnknownEndpoint`;

export async function auditLogRequestSuccess(
  auditLogger: AuditLogger,
  openApiOperationId: string | undefined,
  req: express.Request,
  responseStatus: number,
) {
  if (!openApiOperationId) {
    auditLogUnknownEndpoint(auditLogger, req);
    return;
  }
  auditLogger.auditLog({
    eventName: operationIdToEventName(openApiOperationId),
    stage: 'completion',
    status: 'succeeded',
    level: 'info',
    request: req,
    response: {
      status: responseStatus,
    },
    message: `'${req.method} ${req.path}' endpoint hit by ${await auditLogger.getActorId(req)}`,
  });
}

export async function auditLogRequestError(
  auditLogger: AuditLogger,
  openApiOperationId: string | undefined,
  req: express.Request,
  error: any,
) {
  if (!openApiOperationId) {
    auditLogUnknownEndpoint(auditLogger, req);
    return;
  }
  auditLogger.auditLog({
    eventName: operationIdToEventName(openApiOperationId),
    stage: 'completion',
    status: 'failed',
    level: 'error',
    request: req,
    response: {
      status: 500,
      body: {
        errors: [
          {
            name: error.name,
            message: error.message || 'internal server error',
          },
        ],
      },
    },
    errors: [error],
    message: `Error while requesting the '${req.method} ${req.path}' endpoint (request from ${await auditLogger.getActorId(req)})`,
  });
}

export async function auditLogUnknownEndpoint(
  auditLogger: AuditLogger,
  req: express.Request,
) {
  const error = new NotFoundError(`'${req.method} ${req.path}' not found`);
  auditLogger.auditLog({
    eventName: UNKNOWN_ENDPOINT_EVENT,
    stage: 'initiation',
    status: 'failed',
    level: 'info',
    request: req,
    response: {
      status: 404,
      body: {
        errors: [
          {
            name: error.name,
            message: error.message,
          },
        ],
      },
    },
    errors: [error],
    message: `${await auditLogger.getActorId(req)} requested the unknown '${req.method} ${req.path}' endpoint`,
  });
}

export async function auditLogAuthError(
  auditLogger: AuditLogger,
  openApiOperationId: string | undefined,
  req: express.Request,
  error: NotAllowedError,
) {
  if (!openApiOperationId) {
    auditLogUnknownEndpoint(auditLogger, req);
    return;
  }
  auditLogger.auditLog({
    eventName: operationIdToEventName(openApiOperationId),
    stage: 'authorization',
    status: 'failed',
    level: 'warn',
    request: req,
    response: {
      status: 403,
      body: {
        errors: [
          {
            name: error.name,
            message: error.message,
          },
        ],
      },
    },
    errors: [error],
    message: `${await auditLogger.getActorId(req)} not authorized to request the '${req.method} ${req.path}' endpoint`,
  });
}

function operationIdToEventName(openApiOperationId: string): string {
  if (openApiOperationId.length === 0) {
    return EVENT_PREFIX;
  }
  return `${EVENT_PREFIX}${openApiOperationId.charAt(0).toUpperCase()}${openApiOperationId.slice(1)}`;
}
