import { Logger } from 'winston';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';

export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

type LogMsg = {
  level: 'info' | 'error'; // todo should we support debug or another log levels?
  message: string;
  isAuditLog: true;
  entityRef: string;
};

type LogMsgWithRoleInfo = LogMsg & {
  source: Source;
  modifiedBy?: string;
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

  roleInfo(metadata: RoleMetadataDao, operation: Operation) {
    const logMsg: LogMsg = {
      level: 'info',
      message: `${this.fmtToPastTime(operation)} '${metadata.roleEntityRef}'`,
      isAuditLog: true,
      entityRef: metadata.roleEntityRef,
    };

    this.logger.log(this.toLogMsgWithRoleInfo(logMsg, metadata));
  }

  roleError(roleEntityRef: string, operation: Operation, error: Error) {
    const msg: LogMsg = {
      level: 'error',
      message: `Fail to ${operation} '${roleEntityRef}'. Cause: ${error.message}`,
      isAuditLog: true,
      entityRef: roleEntityRef,
    };
    this.logger.log(msg);
  }

  permissionInfo(
    policy: string[],
    operation: Operation,
    roleMetadata?: RoleMetadataDao,
  ) {
    const actor = roleMetadata ? roleMetadata.roleEntityRef : policy[0];
    let msg: LogMsg | LogMsgWithRoleInfo = {
      level: 'info',
      message: `Permission policy ${policy} was ${this.fmtToPastTime(
        operation,
      )} for: ${actor}`,
      isAuditLog: true,
      entityRef: actor,
    };
    if (roleMetadata) {
      msg = this.toLogMsgWithRoleInfo(msg, roleMetadata);
    }

    this.logger.log(msg);
  }

  permissionError(
    policy: string[],
    operation: Operation,
    error: Error | unknown,
  ) {
    const e =
      error instanceof Error
        ? error
        : new UnknownErrorWrapper('Unknown error occurred');
    const msg: LogMsg = {
      level: 'error',
      message: `Fail to ${operation} permission policy: '${JSON.stringify(
        policy,
      )}'. Cause: ${e.message}. Stack trace: ${e.stack}`,
      isAuditLog: true,
      entityRef: policy[0],
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
