import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

import {
  ConditionEvents,
  ListConditionEvents,
  ListPluginPoliciesEvents,
  PermissionEvents,
  RESPONSE_ERROR,
  RoleEvents,
} from './audit-logger';

// Audit log REST api errors interceptor.
export function auditError(auditLogger: AuditLogger): ErrorRequestHandler {
  return (err: Error, req: Request, _resp: Response, next: NextFunction) => {
    let event = '';
    let message = '';
    switch (true) {
      case req.path.startsWith('/policies'):
        if (req.method === 'POST') {
          event = PermissionEvents.CREATE_POLICY_ERROR;
          message = 'Failed to create permission policies';
        } else if (req.method === 'PUT') {
          event = PermissionEvents.UPDATE_POLICY_ERROR;
          message = 'Failed to update permission policies';
        } else if (req.method === 'DELETE') {
          event = PermissionEvents.DELETE_POLICY_ERROR;
          message = 'Failed to delete permission policies';
        } else if (req.method === 'GET') {
          event = PermissionEvents.GET_POLICY_ERROR;
          message = 'Failed to get permission policies';
        }
        break;
      case req.path.startsWith('/roles'):
        if (req.method === 'POST') {
          event = RoleEvents.CREATE_ROLE_ERROR;
          message = 'Failed to create role';
        } else if (req.method === 'PUT') {
          event = RoleEvents.UPDATE_ROLE_ERROR;
          message = 'Failed to update role';
        } else if (req.method === 'DELETE') {
          event = RoleEvents.DELETE_ROLE_ERROR;
          message = 'Failed to delete role';
        } else if (req.method === 'GET') {
          event = RoleEvents.GET_ROLE_ERROR;
          message = 'Failed to get role';
        }
        break;
      case req.path.startsWith('/roles/conditions'):
        if (req.method === 'POST') {
          event = ConditionEvents.CREATE_CONDITION_ERROR;
          message = 'Failed to create condition';
        } else if (req.method === 'PUT') {
          event = ConditionEvents.UPDATE_CONDITION_ERROR;
          message = 'Failed to update condition';
        } else if (req.method === 'DELETE') {
          event = ConditionEvents.DELETE_CONDITION_ERROR;
          message = 'Failed to delete condition';
        } else if (req.method === 'GET') {
          event = ConditionEvents.GET_CONDITION_ERROR;
          message = 'Failed to get condition';
        }
        break;
      case req.path.startsWith('/plugins/policies'):
        if (req.method === 'GET') {
          event = ListPluginPoliciesEvents.GET_PLUGINS_POLICIES_ERROR;
          message = 'Failed to get list permission policies';
        }
        break;
      case req.path.startsWith('/plugins/condition-rules'):
        if (req.method === 'GET') {
          event = ListConditionEvents.GET_CONDITION_RULES_ERROR;
          message = 'Failed to get list condition rules and schemas';
        }
        break;
      default:
        // log nothing
        next(err);
        return;
    }

    auditLogger
      .auditErrorLog({
        message,
        eventName: event,
        stage: RESPONSE_ERROR,
        request: req,
        errors: [err],
      })
      .then(() => next(err))
      .catch((auditLogError: any) => next(auditLogError));
  };
}
