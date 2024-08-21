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

import { NotAllowedError } from '@backstage/errors';

import express from 'express';
import { Context } from 'openapi-backend';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

export async function auditLogRequestSuccess(
  ctx: Context,
  auditLogger: AuditLogger,
  req: express.Request,
  responseStatus: number,
) {
  auditLogger.auditLog({
    eventName: `${ctx.operation.operationId}EndpointHit`,
    stage: 'completion',
    status: 'succeeded',
    level: 'info',
    request: req,
    response: {
      status: responseStatus,
    },
    message: `'${ctx.request.method} ${ctx.request.path}' endpoint hit by ${await auditLogger.getActorId(req)}`,
  });
}

export async function auditLogRequestError(
  ctx: Context,
  auditLogger: AuditLogger,
  req: express.Request,
  error: any,
) {
  auditLogger.auditLog({
    eventName: `${ctx.operation.operationId}EndpointHit`,
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
    message: `Error while requesting the '${ctx.request.method} ${ctx.request.path}' endpoint (request from ${await auditLogger.getActorId(req)})`,
  });
}

export async function auditLogAuthError(
  ctx: Context,
  auditLogger: AuditLogger,
  req: express.Request,
  error: NotAllowedError,
) {
  auditLogger.auditLog({
    eventName: `${ctx.operation.operationId}EndpointHit`,
    stage: 'authorization',
    status: 'failed',
    level: 'error',
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
    message: `${await auditLogger.getActorId(req)} not authorize to request the '${ctx.request.method} ${ctx.request.path}' endpoint`,
  });
}
