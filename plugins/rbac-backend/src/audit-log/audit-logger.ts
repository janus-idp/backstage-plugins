import { Logger } from 'winston';

import { RoleMetadataDao } from '../database/role-metadata';

export class AuditLogger {
  constructor(private readonly logger: Logger) {}

  error(
    roleEntityRef: string,
    operation: 'create' | 'update' | 'delete',
    error: Error,
  ) {
    this.logger.log({
      level: 'error',
      message: `Fail to ${operation} role: ${roleEntityRef}. Cause: ${error.message}`,
      isAuditLog: true,
    });
  }

  info(
    metadata: RoleMetadataDao,
    operation: 'Created' | 'Updated' | 'Deleted',
  ) {
    const logMsg = {
      level: 'info',
      message: `${operation} role ${metadata.roleEntityRef}`,
      isAuditLog: true,
      source: metadata.source,
      modifiedBy: metadata.modifiedBy,
      lastModified: '',
      author: metadata.author ?? 'no information',
      createdAt: '',
    };

    if (metadata.createdAt) {
      logMsg.createdAt = new Date(metadata.createdAt).toUTCString();
    }

    if (metadata.lastModified) {
      logMsg.lastModified = new Date(metadata.lastModified).toUTCString();
    }

    if (operation === 'Deleted') {
      logMsg.lastModified = new Date().toUTCString();
    }

    this.logger.log(logMsg);
  }
}
