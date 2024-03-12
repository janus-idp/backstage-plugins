import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

import { RoleConditionalPolicyDecision } from '@janus-idp/backstage-plugin-rbac-common';

const CONDITIONAL_TABLE = 'role-condition-policies';

interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  roleEntityRef: string;
  pluginId: string;
  resourceType: string;
  conditionsJson: string;
}

export interface ConditionalStorage {
  getConditions(
    roleEntityRef: string,
    pluginId: string,
    resourceType: string,
  ): Promise<RoleConditionalPolicyDecision[]>;
  createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<number>;
  findCondition(
    roleEntityRef: string,
    resourceType: string,
  ): Promise<RoleConditionalPolicyDecision | undefined>;
  getCondition(id: number): Promise<RoleConditionalPolicyDecision | undefined>;
  deleteCondition(roleEntityRef: string, id: number): Promise<void>;
  updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<void>;
}

export class DataBaseConditionalStorage implements ConditionalStorage {
  public constructor(private readonly knex: Knex<any, any[]>) {}

  async getConditions(
    roleEntityRef: string,
    pluginId: string,
    resourceType: string, // todo add ? where needed...
  ): Promise<RoleConditionalPolicyDecision[]> {
    const daoRaws = await this.knex?.table(CONDITIONAL_TABLE).where(builder => {
      if (pluginId) {
        builder.where('pluginId', pluginId);
      }
      if (resourceType) {
        builder.where('resourceType', resourceType);
      }
      if (roleEntityRef) {
        builder.where('roleEntityRef', resourceType);
      }
    });

    let conditions: RoleConditionalPolicyDecision[] = [];
    if (daoRaws) {
      conditions = daoRaws.map(dao => this.daoToConditionalDecision(dao));
    }

    return conditions;
  }

  async createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<number> {
    const condition = await this.findCondition(
      conditionalDecision.roleEntityRef,
      conditionalDecision.resourceType,
    );
    if (condition) {
      throw new ConflictError(
        `A condition with resource type ${condition.resourceType} has already been stored`,
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

  async findCondition(
    roleEntityRef: string,
    resourceType: string,
  ): Promise<RoleConditionalPolicyDecision | undefined> {
    const daoRaw = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('roleEntityRef', roleEntityRef)
      .where('resourceType', resourceType)
      // condition with specified resource type should be unique.
      .first();

    if (daoRaw) {
      return this.daoToConditionalDecision(daoRaw);
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

  async deleteCondition(roleEntityRef: string, id: number): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }
    await this.knex
      ?.table(CONDITIONAL_TABLE)
      .delete()
      .whereIn('id', [id])
      .whereIn('roleEntityRef', [roleEntityRef]);
  }

  async updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision,
  ): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }
    if (condition.resourceType !== conditionalDecision.resourceType) {
      const conflictedCond = await this.findCondition(
        conditionalDecision.roleEntityRef,
        conditionalDecision.resourceType,
      );
      if (conflictedCond) {
        throw new ConflictError(
          `A condition with resource type ${condition.resourceType} has already been stored`,
        );
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
    const { result, pluginId, resourceType, conditions, roleEntityRef } =
      conditionalDecision;
    const conditionsJson = JSON.stringify(conditions);
    return {
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
    };
  }

  private daoToConditionalDecision(
    dao: ConditionalPolicyDecisionDAO,
  ): RoleConditionalPolicyDecision {
    if (!dao.id) {
      throw new InputError(`Missed id in the dao object: ${dao}`);
    }
    const { result, pluginId, resourceType, conditionsJson, roleEntityRef } =
      dao;
    const conditions = JSON.parse(conditionsJson);
    return {
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
    };
  }
}
