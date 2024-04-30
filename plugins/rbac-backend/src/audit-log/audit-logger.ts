import { Logger } from 'winston';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';

export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

type LogMsg = {
  level: 'info' | 'error'; // todo should we support debug or another log levels?
  message: string;
  isAuditLog: true;
  entityRef: string;
  source: Source;
  modifiedBy?: string;
};

type LogMsgWithRoleInfo = LogMsg & {
  lastModified?: string;
  author?: string;
  createdAt?: string;
  roleDescription?: string;
};

class UnknownErrorWrapper extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuditLogger {
  constructor(private readonly logger: Logger) {}

  // todo add members information.....
  roleInfo(metadata: RoleMetadataDao, operation: Operation) {
    const logMsg: LogMsg = {
      level: 'info',
      message: `${this.fmtToPastTime(operation)} '${metadata.roleEntityRef}'`,
      isAuditLog: true,
      entityRef: metadata.roleEntityRef,
      source: metadata.source,
      modifiedBy: metadata.modifiedBy,
    };

    this.logger.log(this.toLogMsgWithRoleInfo(logMsg, metadata));
  }

  roleError(
    roleEntityRef: string,
    operation: Operation,
    source: Source,
    modifiedBy: string,
    error: Error,
  ) {
    const msg: LogMsg = {
      level: 'error',
      message: `Fail to ${operation} '${roleEntityRef}'. Cause: ${error.message}`,
      isAuditLog: true,
      entityRef: roleEntityRef,
      source,
      modifiedBy,
    };
    this.logger.log(msg);
  }

  permissionInfo(
    policies: string[][],
    operation: Operation,
    source: Source,
    modifiedBy: string,
    oldPolicies?: string[][],
  ) {
    const entityRef = policies[0][0];
    let message = `${this.fmtToPastTime(
      operation,
    )} permission policies ${JSON.stringify(policies)} for '${entityRef}'`;

    if (operation === 'UPDATE') {
      message = `${this.fmtToPastTime(
        operation,
      )} permission policies from ${JSON.stringify(
        policies,
      )} to ${JSON.stringify(oldPolicies)} for '${entityRef}'`;
    }

    this.logger.log({
      level: 'info',
      message,
      isAuditLog: true,
      entityRef,
      source,
      modifiedBy,
    });
  }

  permissionError(
    policies: string[][],
    operation: Operation,
    source: Source,
    modifiedBy: string,
    error: Error | unknown,
  ) {
    const e =
      error instanceof Error
        ? error
        : new UnknownErrorWrapper('Unknown error occurred');
    const msg: LogMsg = {
      level: 'error',
      message: `Fail to ${operation} permission policy: '${JSON.stringify(
        policies,
      )}'. Cause: ${e.message}. Stack trace: ${e.stack}`,
      isAuditLog: true,
      entityRef: policies[0][0],
      source,
      modifiedBy,
    };

    this.logger.log(msg);
  }

  conditionInfo() {}

  conditionError() {}

  private toLogMsgWithRoleInfo(
    msg: LogMsg,
    metadata: RoleMetadataDao,
  ): LogMsgWithRoleInfo {
    const result: LogMsgWithRoleInfo = {
      ...msg,
      entityRef: metadata.roleEntityRef,
      source: metadata.source,
      modifiedBy: metadata.modifiedBy,
      lastModified: '',
      author: metadata.author ?? 'no information',
      createdAt: '',
      roleDescription: metadata.description ?? 'no information',
    };

    if (metadata.createdAt) {
      result.createdAt = new Date(metadata.createdAt).toUTCString();
    }

    if (metadata.lastModified) {
      result.lastModified = new Date(metadata.lastModified).toUTCString();
    }

    return result;
  }

  private fmtToPastTime(operation: Operation): string {
    let result = '';
    switch (operation) {
      case 'CREATE':
        result = 'Created';
        break;
      case 'UPDATE':
        result = 'Updated';
        break;
      case 'DELETE':
        result = 'Deleted';
        break;
      default: // do nothing;
    }
    return result;
  }
}
