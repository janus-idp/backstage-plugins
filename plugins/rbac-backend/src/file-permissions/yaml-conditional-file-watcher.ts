import { AuthService, LoggerService } from '@backstage/backend-plugin-api';

import yaml from 'js-yaml';
import { omit } from 'lodash';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  ConditionAuditInfo,
  ConditionEvents,
  HANDLE_RBAC_DATA_STAGE,
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
    };
  }

  async initialize(): Promise<void> {
    await this.onChange();

    if (this.allowReload) {
      this.watchFile();
    }
  }

  async onChange(): Promise<void> {
    try {
      const newConds = this.parse();

      const addedConds: RoleConditionalPolicyDecision<PermissionAction>[] = [];
      const removedConds: RoleConditionalPolicyDecision<PermissionAction>[] =
        [];

      const csvFileRoles = (
        await this.roleMetadataStorage.filterRoleMetadata('csv-file')
      ).map(role => role.roleEntityRef);
      const existedFileConds = (
        await this.conditionalStorage.filterConditions(csvFileRoles)
      ).map(condition => {
        return {
          ...condition,
          permissionMapping: condition.permissionMapping.map(pm => pm.action),
        };
      });

      // Find added conditions
      for (const condition of newConds) {
        if (!condition) {
          continue;
        }

        const roleMetadata = await this.roleMetadataStorage.findRoleMetadata(
          condition.roleEntityRef,
        );
        if (!roleMetadata) {
          this.logger.warn(
            `skip to add condition for role ${condition.roleEntityRef}. Role does not exist`,
          );
          continue;
        }
        if (roleMetadata.source !== 'csv-file') {
          this.logger.warn(
            `skip to add condition for role ${condition.roleEntityRef}. Role is not from csv-file`,
          );
          continue;
        }
        validateRoleCondition(condition);

        const existingCondition = existedFileConds.find(c =>
          deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
        );

        if (!existingCondition) {
          addedConds.push(condition);
        }
      }

      // Find removed conditions
      for (const condition of existedFileConds) {
        if (
          !newConds.find(c =>
            deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
          )
        ) {
          removedConds.push(condition);
        }
      }

      this.conditionsDiff = {
        addedConditions: addedConds,
        removedConditions: removedConds,
      };

      console.log(`====== DIFF ${JSON.stringify(newConds)}`); // todo: remove it

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
      this.handleError(
        'Failed to parse conditional policies file',
        error,
        ConditionEvents.PARSE_CONDITION_ERROR,
      );
      return [];
    }
  }

  async handleFileChanges(): Promise<void> {
    await this.removeConditions();
    await this.addConditions();
  }

  async addConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.addedConditions) {
        const conditionToCreate = await processConditionMapping(
          condition,
          this.pluginMetadataCollector,
          this.auth,
        );

        await this.conditionalStorage.createCondition(conditionToCreate);

        await this.auditLogger.auditLog<ConditionAuditInfo>({
          message: `Created conditional permission policy`,
          eventName: ConditionEvents.CREATE_CONDITION,
          metadata: { condition },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    } catch (error) {
      await this.handleError(
        'Failed to create condition',
        error,
        ConditionEvents.CREATE_CONDITION_ERROR,
      );
    }
    this.conditionsDiff.addedConditions = [];
  }

  async removeConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.removedConditions) {
        const conditionToDelete = (
          await this.conditionalStorage.filterConditions(
            condition.roleEntityRef,
            condition.pluginId,
            condition.resourceType,
            condition.permissionMapping,
          )
        )[0];
        await this.conditionalStorage.deleteCondition(conditionToDelete.id);

        await this.auditLogger.auditLog<ConditionAuditInfo>({
          message: `Deleted conditional permission policy`,
          eventName: ConditionEvents.DELETE_CONDITION,
          metadata: { condition },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    } catch (error) {
      await this.handleError(
        'Failed to delete condition by id',
        error,
        ConditionEvents.DELETE_CONDITION_ERROR,
      );
    }

    this.conditionsDiff.removedConditions = [];
  }

  async handleError(
    message: string,
    error: unknown,
    event: string,
  ): Promise<void> {
    await this.auditLogger.auditLog({
      message,
      eventName: event,
      stage: HANDLE_RBAC_DATA_STAGE,
      status: 'failed',
      errors: [error],
    });
  }
}
