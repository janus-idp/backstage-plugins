import { Logger } from 'winston';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';

export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

type LogMsg = {
  level: 'info' | 'error'; // todo should we support debug or another log levels?
  message: string;
  isAuditLog: true;
  entityRef: string | string[];
  source: Source;
  modifiedBy?: string;
  time: string;
};

type LogMsgWithRoleInfo = LogMsg & {
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
      time: new Date().toUTCString(),
    };

    this.logger.log(this.toLogMsgWithRoleInfo(logMsg, metadata));
  }

  roleError(
    roleEntityRefs: string | string[],
    operation: Operation[],
    error: Error | unknown,
    source: Source,
    modifiedBy?: string,
  ) {
    const e =
      error instanceof Error
        ? error
        : new UnknownErrorWrapper('Unknown error occurred');

    const msg: LogMsg = {
      level: 'error',
      message: `Fail to ${operation} '${JSON.stringify(
        roleEntityRefs,
      )}'. Cause: ${e.message}. Stack trace: ${e.stack}`,
      isAuditLog: true,
      entityRef: roleEntityRefs,
      source,
      modifiedBy,
      time: new Date().toUTCString(),
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

    const msg: LogMsg = {
      level: 'info',
      message,
      isAuditLog: true,
      entityRef,
      source,
      modifiedBy,
      time: new Date().toUTCString(),
    };
    this.logger.log(msg);
  }

  permissionError(
    policies: string[][],
    operation: Operation[],
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
      time: new Date().toUTCString(),
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
      roleDescription: metadata.description ?? 'no information',
    };

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
