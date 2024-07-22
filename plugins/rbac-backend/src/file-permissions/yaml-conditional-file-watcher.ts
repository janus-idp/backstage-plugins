import { AuthService, LoggerService } from '@backstage/backend-plugin-api';

import { watch } from 'chokidar';
import yaml from 'js-yaml';
import { isEqual, omit } from 'lodash';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import fs from 'fs';

import {
  ConditionAuditInfo,
  ConditionEvents,
  SEND_RESPONSE_STAGE,
} from '../audit-log/audit-logger';
import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { deepSortEqual, processConditionMapping } from '../helper';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { validateRoleCondition } from '../validation/condition-validation';
import { AbstractFileWatcher } from './file-watcher';

type ConditionalPoliciesDiff = {
  addedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
  removedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
};

export class YamlConditinalPoliciesFileWatcher extends AbstractFileWatcher<
  RoleConditionalPolicyDecision<PermissionAction>[]
> {
  private watcher: fs.FSWatcher | null = null;
  private conditionsDiff: ConditionalPoliciesDiff;

  constructor(
    filePath: string,
    allowReload: boolean,
    logger: LoggerService,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly auditLogger: AuditLogger,
    private readonly auth: AuthService,
    private readonly pluginMetadataCollector: PluginPermissionMetadataCollector,
    private readonly roleMetadataStorage: RoleMetadataStorage,
  ) {
    super(filePath, allowReload, logger);

    this.conditionsDiff = {
      addedConditions: [],
      removedConditions: [],
      // updatedConditions: [],
    };
  }

  async initialize(): Promise<void> {
    this.watcher = watch(this.filePath, { persistent: true });

    await this.onChange();

    if (this.allowReload) {
      this.watchFile();
    }
  }

  async onChange(): Promise<void> {
    try {
      console.log(`====== onChange`);
      const newConditions = this.parse();

      const addedConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
        [];
      const removedConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
        [];

      const existedConditions = (
        await this.conditionalStorage.filterConditions()
      ).map(condition => {
        return {
          ...condition,
          permissionMapping: condition.permissionMapping.map(pm => pm.action),
        };
      });

      // Find added conditions
      for (const condition of newConditions) {
        if (!condition) {
          continue;
        }
        validateRoleCondition(condition);

        const roleMetadata = await this.roleMetadataStorage.findRoleMetadata(
          condition.roleEntityRef,
        );
        if (!roleMetadata) {
          this.logger.warn(
            `skip to add condition for role ${condition.roleEntityRef}. Role does not exist`,
          ); // todo: use audit log
          continue;
        }
        if (roleMetadata.source !== 'csv-file') {
          this.logger.warn(
            `skip to add condition for role ${condition.roleEntityRef}. Role is not from csv-file`,
          ); // todo: use audit log
          continue;
        }

        const existingCondition = existedConditions.find(c =>
          deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
        );

        if (!existingCondition) {
          addedConditions.push(condition);
        }
      }

      // Find removed conditions
      const existedFileConditions = await existedConditions.filter(async c => {
        const roleMetadata = await this.roleMetadataStorage.findRoleMetadata(
          c.roleEntityRef,
        );
        return roleMetadata && roleMetadata.source === 'csv-file';
      });

      console.log(
        `====== existed file conditions ${JSON.stringify(existedFileConditions)}`,
      );
      for (const condition of existedConditions) {
        if (
          !newConditions.find(c =>
            deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
          )
        ) {
          removedConditions.push(condition);
        }
      }

      this.conditionsDiff = {
        addedConditions,
        removedConditions,
      };

      console.log(`====== DIFF ${JSON.stringify(newConditions)}`);

      await this.handleFileChanges();
    } catch (error) {
      this.logger.error(`Error watching file: ${error}`);
    }
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

  async handleFileChanges(): Promise<void> {
    await this.removeConditions();
    await this.addConditions();
    // await this.updateConditions();
  }

  async addConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.addedConditions) {
        const conditionToCreate = await processConditionMapping(
          condition,
          this.pluginMetadataCollector,
          this.auth,
        );
        console.log(
          `------ CREATE CONDITION: ${JSON.stringify(conditionToCreate)}`,
        );
        await this.conditionalStorage.createCondition(conditionToCreate);

        // await this.auditLogger.auditLog<ConditionAuditInfo>({
        //   message: `Created conditional permission policy`,
        //   eventName: ConditionEvents.CREATE_CONDITION,
        //   metadata: { condition: roleConditionPolicy },
        //   stage: SEND_RESPONSE_STAGE,
        //   status: 'succeeded',
        //   request,
        //   response: { status: 201, body },
        // });
      }
    } catch (error) {
      console.error('Error adding conditions:', error);
    }
    this.conditionsDiff.addedConditions = [];
  }

  async removeConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.removedConditions) {
        const conditionToDelete =
          await this.conditionalStorage.filterConditions(
            condition.roleEntityRef,
            condition.pluginId,
            condition.resourceType,
            condition.permissionMapping,
          );
        await this.conditionalStorage.deleteCondition(conditionToDelete[0].id);
      }
    } catch (error) {
      console.error('Error removing conditions:', error);
    }

    this.conditionsDiff.removedConditions = [];
  }
}
