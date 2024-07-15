import { LoggerService } from '@backstage/backend-plugin-api';

import { watch } from 'chokidar';
import yaml from 'js-yaml';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import fs from 'fs';

import { ConditionalStorage } from '../database/conditional-storage';
import { AbstractFileWatcher } from './file-watcher';

export class YamlConditinalPoliciesFileWatcher extends AbstractFileWatcher<
  RoleConditionalPolicyDecision<PermissionAction>[]
> {
  private watcher: fs.FSWatcher | null = null;

  constructor(
    filePath: string,
    allowReload: boolean,
    logger: LoggerService,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly auditLogger: AuditLogger,
  ) {
    super(filePath, allowReload, logger);
  }

  async initialize(): Promise<void> {
    this.watcher = watch(this.filePath, { persistent: true });
    this.watcher.on('change', this.parse.bind(this));
    this.watcher.on('error', this.handleError.bind(this));

    if (this.allowReload) {
      this.watchFile();
    }
  }

  async onChange(): Promise<void> {
    const conditions = this.getCurrentContents();
    console.log(`====== ${conditions}`);
  }

  async updateConditions(): Promise<void> {
    // await this.conditionalStorage.updateConditions(conditions);
  }

  /**
   * Reads the current contents of the file and parses it.
   * @returns parsed data.
   */
  parse(): RoleConditionalPolicyDecision<PermissionAction>[] {
    try {
      const fileContents = this.getCurrentContents();
      const data = yaml.load(fileContents);
      if (!Array.isArray(data)) {
        throw new Error(`yaml file ${this.filePath} must contain an array`);
      }
      return data;
    } catch (error: unknown) {
      this.handleError(error as Error);
      return [];
    }
  }

  handleError(error: Error): void {
    console.error('Error watching file:', error);
  }
}
