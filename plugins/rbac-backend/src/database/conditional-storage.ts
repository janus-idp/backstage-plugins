import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

import {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

export const CONDITIONAL_TABLE = 'role-condition-policies';

export interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  roleEntityRef: string;
  permissions: string;
  pluginId: string;
  resourceType: string;
  conditionsJson: string;
}

export interface ConditionalStorage {
  filterConditions(
    roleEntityRef?: string,
    pluginId?: string,
    resourceType?: string,
    actions?: PermissionAction[],
    permissionNames?: string[],
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo>[]>;
  createCondition(
    conditionalDecision: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<number>;
  findUniqueCondition(
    roleEntityRef: string,
    resourceType: string,
    queryPermissionNames: string[],
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo> | undefined>;
  getCondition(
    id: number,
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo> | undefined>;
  deleteCondition(id: number): Promise<void>;
  updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<void>;
}

export class DataBaseConditionalStorage implements ConditionalStorage {
  public constructor(private readonly knex: Knex<any, any[]>) {}

  async filterConditions(
    roleEntityRef?: string,
    pluginId?: string,
    resourceType?: string,
    actions?: PermissionAction[],
    permissionNames?: string[],
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo>[]> {
    const daoRaws = await this.knex?.table(CONDITIONAL_TABLE).where(builder => {
      if (pluginId) {
        builder.where('pluginId', pluginId);
      }
      if (resourceType) {
        builder.where('resourceType', resourceType);
      }
      if (roleEntityRef) {
        builder.where('roleEntityRef', roleEntityRef);
      }
    });

    let conditions: RoleConditionalPolicyDecision<PermissionInfo>[] = [];
    if (daoRaws) {
      conditions = daoRaws.map(dao => this.daoToConditionalDecision(dao));
    }

    if (permissionNames && permissionNames.length > 0) {
      conditions = conditions.filter(condition => {
        return permissionNames.every(permissionName =>
          condition.permissionMapping
            .map(permInfo => permInfo.name)
            .includes(permissionName),
        );
      });
    }

    if (actions && actions.length > 0) {
      conditions = conditions.filter(condition => {
        return actions.every(action =>
          condition.permissionMapping
            .map(permInfo => permInfo.action)
            .includes(action),
        );
      });
    }

    return conditions;
  }

  async createCondition(
    conditionalDecision: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<number> {
    const condition = await this.findUniqueCondition(
      conditionalDecision.roleEntityRef,
      conditionalDecision.resourceType,
      conditionalDecision.permissionMapping.map(permInfo => permInfo.name),
    );
    if (condition) {
      throw new ConflictError(
        `A condition with resource type '${condition.resourceType}'` +
          ` and permission '${JSON.stringify(condition.permissionMapping)}'` +
          ` has already been stored for role '${conditionalDecision.roleEntityRef}'`,
      );
    }

    const conditionRaw = this.toDAO(conditionalDecision);
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .insert<ConditionalPolicyDecisionDAO>(conditionRaw)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the condition.`);
  }

  async findUniqueCondition(
    roleEntityRef: string,
    resourceType: string,
    queryPermissionNames: string[],
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo> | undefined> {
    const daoRaws = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('roleEntityRef', roleEntityRef)
      .where('resourceType', resourceType);

    if (daoRaws) {
      const conditions = daoRaws.map(daoRaw =>
        this.daoToConditionalDecision(daoRaw),
      );

      return conditions.find(condition => {
        const conditionPermissionNames = condition.permissionMapping.map(
          permInfo => permInfo.name,
        );
        const isContainTheSamePermissions = queryPermissionNames.every(name =>
          conditionPermissionNames.includes(name),
        );
        return (
          isContainTheSamePermissions &&
          conditionPermissionNames.length === queryPermissionNames.length
        );
      });
    }
    return undefined;
  }

  async getCondition(
    id: number,
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo> | undefined> {
    const daoRaw = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('id', id)
      .first();

    if (daoRaw) {
      return this.daoToConditionalDecision(daoRaw);
    }
    return undefined;
  }

  async deleteCondition(id: number): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }
    await this.knex?.table(CONDITIONAL_TABLE).delete().whereIn('id', [id]);
  }

  async updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }

    const conditionsForTheSameResource = await this.filterConditions(
      conditionalDecision.roleEntityRef,
      conditionalDecision.pluginId,
      conditionalDecision.resourceType,
    );

    for (const permission of conditionalDecision.permissionMapping) {
      for (const conditionToCompare of conditionsForTheSameResource) {
        if (conditionToCompare.id === id) {
          continue;
        }
        const conditionPermNames = conditionToCompare.permissionMapping.map(
          perm => perm.name,
        );
        if (conditionPermNames.includes(permission.name)) {
          throw new ConflictError(
            `Found condition with conflicted permission '${JSON.stringify(
              permission,
            )}'. Role could have multiple ` +
              `conditions for the same resource type '${conditionalDecision.resourceType}', but with different permission name and action sets.`,
          );
        }
      }
    }

    const conditionRaw = this.toDAO(conditionalDecision);
    conditionRaw.id = id;
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('id', conditionRaw.id)
      .update<ConditionalPolicyDecisionDAO>(conditionRaw)
      .returning('id');

    if (!result || result.length === 0) {
      throw new Error(`Failed to update the condition with id: ${id}.`);
    }
  }

  private toDAO(
    conditionalDecision: RoleConditionalPolicyDecision<PermissionInfo>,
  ): ConditionalPolicyDecisionDAO {
    const {
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      permissionMapping,
    } = conditionalDecision;
    const conditionsJson = JSON.stringify(conditions);
    return {
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
      permissions: JSON.stringify(permissionMapping),
    };
  }

  private daoToConditionalDecision(
    dao: ConditionalPolicyDecisionDAO,
  ): RoleConditionalPolicyDecision<PermissionInfo> {
    if (!dao.id) {
      throw new InputError(`Missed id in the dao object: ${dao}`);
    }
    const {
      id,
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
      permissions,
    } = dao;

    const conditions = JSON.parse(conditionsJson);
    return {
      id,
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      permissionMapping: JSON.parse(permissions),
    };
  }
}
