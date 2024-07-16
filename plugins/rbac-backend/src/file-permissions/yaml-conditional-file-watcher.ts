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
import { deepSortEqual, processConditionMapping } from '../helper';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { validateRoleCondition } from '../validation/condition-validation';
import { AbstractFileWatcher } from './file-watcher';

type ConditionalPoliciesDiff = {
  addedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
  removedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
  // updatedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
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
    this.watcher.on('change', this.onChange.bind(this));
    this.watcher.on('error', this.handleError.bind(this));

    await this.onChange();

    if (this.allowReload) {
      this.watchFile();
    }
  }

  async onChange(): Promise<void> {
    const conditions = this.parse();
    conditions.forEach(condition => validateRoleCondition(condition)); // todo validate only new added conditions?

    const newConditions = this.parse();
    const addedConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
      [];
    const removedConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
      [];
    // const updatedConditions: RoleConditionalPolicyDecision<PermissionAction>[] = [];

    const existedConditions = (await this.conditionalStorage.filterConditions())
      .map(condition => {
        return {
          ...condition,
          permissionMapping: condition.permissionMapping.map(pm => pm.action),
        };
      })
      .map(c => omit(c, ['id']));

    console.log(
      `========== existed conditions ${JSON.stringify(existedConditions)}`,
    );

    // Find added conditions
    for (const condition of newConditions) {
      const existingCondition = existedConditions.find(c =>
        deepSortEqual(c, omit(condition, ['id'])),
      );
      console.log(
        `====== ${JSON.stringify(existingCondition)} ${JSON.stringify(condition)}`,
      );
      if (!existingCondition) {
        addedConditions.push(condition);
      }
    }

    // Find removed conditions
    // for (const condition of this.conditionsDiff.addedConditions) {
    //   // this.conditionalStorage.filterConditions()
    //   const existingCondition = newConditions.find(c => c.id === condition.id);
    //   if (!existingCondition) {
    //     removedConditions.push(condition);
    //   }
    // }

    // Find updated conditions
    // for (const condition of newConditions) {
    //   const existingCondition = this.conditionsDiff.addedConditions.find(c => c.id === condition.id);
    //   console.log(`====== ${JSON.stringify(existingCondition)} ${JSON.stringify(condition)}`);
    //   if (existingCondition && !isEqual(existingCondition, condition)) {
    //     updatedConditions.push(condition);
    //   }
    // }

    this.conditionsDiff = {
      addedConditions,
      removedConditions,
      // updatedConditions,
    };

    // console.log(`====== ${JSON.stringify(conditions)}`);

    await this.handleFileChanges();
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
        await this.conditionalStorage.createCondition(conditionToCreate);
      }
    } catch (error) {
      console.error('Error adding conditions:', error);
    }
    this.conditionsDiff.addedConditions = [];

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

  async removeConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.removedConditions) {
        await this.conditionalStorage.deleteCondition(condition.id);
      }
    } catch (error) {
      console.error('Error removing conditions:', error);
    }

    this.conditionsDiff.removedConditions = [];
  }

  // async updateConditions(): Promise<void> {
  //   for (const condition of this.conditionsDiff.updatedConditions) {
  //     const conditionToUpdate = await processConditionMapping(
  //       condition,
  //       this.pluginMetadataCollector,
  //       this.auth
  //     );
  //     await this.conditionalStorage.updateCondition(conditionToUpdate.id, conditionToUpdate);
  //   }
  // }
}
