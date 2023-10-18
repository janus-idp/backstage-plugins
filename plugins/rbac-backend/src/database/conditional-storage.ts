import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import {
  AuthorizeResult,
  ConditionalPolicyDecision,
} from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

const CONDITIONAL_TABLE = 'policy-conditions';
const migrationsDir = resolvePackagePath(
  '@janus-idp/backstage-plugin-rbac-backend', // Package name
  'migrations', // Migrations directory
);

interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  pluginId: string;
  resourceType: string;
  conditionsJson: string;
}

export interface ConditionalStorage {
  getConditions(
    pluginId: string,
    resourceType: string,
  ): Promise<ConditionalPolicyDecision[]>;
  createCondition(
    conditionalDecision: ConditionalPolicyDecision,
  ): Promise<number>;
  findCondition(
    resourceType: string,
  ): Promise<ConditionalPolicyDecision | undefined>;
  getCondition(id: number): Promise<ConditionalPolicyDecision | undefined>;
  deleteCondition(id: number): Promise<void>;
  updateCondition(
    id: number,
    conditionalDecision: ConditionalPolicyDecision,
  ): Promise<void>;
}

export class DataBaseConditionalStorage implements ConditionalStorage {
  public constructor(private readonly knex: Knex<any, any[]>) {}

  static async create(
    databaseManager: PluginDatabaseManager,
  ): Promise<ConditionalStorage> {
    const knex = await databaseManager.getClient();

    if (!databaseManager.migrations?.skip) {
      await knex.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DataBaseConditionalStorage(knex);
  }

  async getConditions(
    pluginId: string,
    resourceType: string,
  ): Promise<ConditionalPolicyDecision[]> {
    const daoRaws = await this.knex?.table(CONDITIONAL_TABLE).where(builder => {
      if (pluginId) {
        builder.where('pluginId', pluginId);
      }
      if (resourceType) {
        builder.where('resourceType', resourceType);
      }
    });

    let conditions: ConditionalPolicyDecision[] = [];
    if (daoRaws) {
      conditions = daoRaws.map(dao => this.daoToConditionalDecision(dao));
    }

    return conditions;
  }

  async createCondition(
    conditionalDecision: ConditionalPolicyDecision,
  ): Promise<number> {
    const condition = await this.findCondition(
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
      .insert<ConditionalPolicyDecision>(conditionRaw)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the condition.`);
  }

  async findCondition(
    resourceType: string,
  ): Promise<ConditionalPolicyDecision | undefined> {
    const daoRaw = await this.knex
      ?.table(CONDITIONAL_TABLE)
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
  ): Promise<ConditionalPolicyDecision | undefined> {
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
    conditionalDecision: ConditionalPolicyDecision,
  ): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }
    if (condition.resourceType !== conditionalDecision.resourceType) {
      const conflictedCond = await this.findCondition(
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
      .update<ConditionalPolicyDecision>(conditionRaw)
      .returning('id');

    if (!result || result.length === 0) {
      throw new Error(`Failed to update the condition with id: ${id}.`);
    }
  }

  private toDAO(
    conditionalDecision: ConditionalPolicyDecision,
  ): ConditionalPolicyDecisionDAO {
    const { result, pluginId, resourceType, conditions } = conditionalDecision;
    const conditionsJson = JSON.stringify(conditions);
    return {
      result,
      pluginId,
      resourceType,
      conditionsJson,
    };
  }

  private daoToConditionalDecision(
    dao: ConditionalPolicyDecisionDAO,
  ): ConditionalPolicyDecision {
    if (!dao.id) {
      throw new InputError(`Missed id in the dao object: ${dao}`);
    }
    const { result, pluginId, resourceType, conditionsJson } = dao;
    const conditions = JSON.parse(conditionsJson);
    return {
      result,
      pluginId,
      resourceType,
      conditions,
    };
  }
}
