import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

export const CONDITIONAL_TABLE = 'role-condition-policies';

export interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  roleEntityRef: string;
  actions: string;
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
  ): Promise<RoleConditionalPolicyDecision[]>;
  createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<number>;
  findUniqueCondition(
    roleEntityRef: string,
    resourceType: string,
    actions: PermissionAction[],
  ): Promise<RoleConditionalPolicyDecision | undefined>;
  getCondition(id: number): Promise<RoleConditionalPolicyDecision | undefined>;
  deleteCondition(id: number): Promise<void>;
  updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<void>;
}

export class DataBaseConditionalStorage implements ConditionalStorage {
  public constructor(private readonly knex: Knex<any, any[]>) {}

  async filterConditions(
    roleEntityRef?: string,
    pluginId?: string,
    resourceType?: string,
    filterActions?: PermissionAction[] | undefined,
  ): Promise<RoleConditionalPolicyDecision[]> {
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

    let conditions: RoleConditionalPolicyDecision[] = [];
    if (daoRaws) {
      conditions = daoRaws.map(dao => this.daoToConditionalDecision(dao));
    }

    if (filterActions && filterActions.length > 0) {
      return conditions.filter(condition => {
        return filterActions.every(filterAction =>
          condition.actions.includes(filterAction),
        );
      });
    }

    return conditions;
  }

  async createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<number> {
    const condition = await this.findUniqueCondition(
      conditionalDecision.roleEntityRef,
      conditionalDecision.resourceType,
      conditionalDecision.actions,
    );
    if (condition) {
      throw new ConflictError(
        `A condition with resource type '${condition.resourceType}'` +
          ` and actions '${JSON.stringify(condition.actions)}'` +
          ` has already been stored for role '${conditionalDecision.roleEntityRef}'`,
      );
    }

    const conditionRaw = this.toDAO(conditionalDecision);
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .insert<RoleConditionalPolicyDecision>(conditionRaw)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the condition.`);
  }

  async findUniqueCondition(
    roleEntityRef: string,
    resourceType: string,
    uniqueActions: PermissionAction[],
  ): Promise<RoleConditionalPolicyDecision | undefined> {
    const daoRaws = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('roleEntityRef', roleEntityRef)
      .where('resourceType', resourceType);

    if (daoRaws) {
      const conditions = daoRaws.map(daoRaw =>
        this.daoToConditionalDecision(daoRaw),
      );

      return conditions.filter(condition => {
        return (
          uniqueActions.every(uniqueAction =>
            condition.actions.includes(uniqueAction),
          ) && condition.actions.length === uniqueActions.length
        );
      })[0];
    }
    return undefined;
  }

  async getCondition(
    id: number,
  ): Promise<RoleConditionalPolicyDecision | undefined> {
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
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }

    const conditionsForTheSameResource = await this.filterConditions(
      conditionalDecision.roleEntityRef,
      undefined,
      conditionalDecision.resourceType,
    );

    for (const updateAction of conditionalDecision.actions) {
      for (const conditionToCompare of conditionsForTheSameResource) {
        if (conditionToCompare.id === id) {
          continue;
        }
        if (conditionToCompare.actions.includes(updateAction)) {
          throw new ConflictError(
            `Found condition with conflicted action '${updateAction}'. Role could have multiple ` +
              `conditions for the same resource type '${conditionalDecision.resourceType}', but with different action sets.`,
          );
        }
      }
    }

    const conditionRaw = this.toDAO(conditionalDecision);
    conditionRaw.id = id;
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('id', conditionRaw.id)
      .update<RoleConditionalPolicyDecision>(conditionRaw)
      .returning('id');

    if (!result || result.length === 0) {
      throw new Error(`Failed to update the condition with id: ${id}.`);
    }
  }

  private toDAO(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): ConditionalPolicyDecisionDAO {
    const {
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      actions,
    } = conditionalDecision;
    const conditionsJson = JSON.stringify(conditions);
    return {
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
      actions: JSON.stringify(actions),
    };
  }

  private daoToConditionalDecision(
    dao: ConditionalPolicyDecisionDAO,
  ): RoleConditionalPolicyDecision {
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
      actions,
    } = dao;

    const conditions = JSON.parse(conditionsJson);
    return {
      id,
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      actions: JSON.parse(actions),
    };
  }
}
