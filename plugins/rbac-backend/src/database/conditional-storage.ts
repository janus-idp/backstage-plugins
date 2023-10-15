import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { InputError } from '@backstage/errors';
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

// dao
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
  ): Promise<boolean>;
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
    const conditionRaw = this.toDAO(conditionalDecision);
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .insert<ConditionalPolicyDecision>(conditionRaw)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }
    // todo handle error better...
    return -1;
  }

  async findCondition(
    resourceType: string,
  ): Promise<ConditionalPolicyDecision | undefined> {
    const daoRaw = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('resourceType', resourceType)
      // todo handle few conditions...
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
    await this.knex?.table(CONDITIONAL_TABLE).delete().whereIn('id', [id]);
  }

  async updateCondition(
    id: number,
    conditionalDecision: ConditionalPolicyDecision,
  ): Promise<boolean> {
    const conditionRaw = this.toDAO(conditionalDecision);
    conditionRaw.id = id;
    const result = await this.knex
      ?.table(CONDITIONAL_TABLE)
      .where('id', conditionRaw.id)
      .update<ConditionalPolicyDecision>(conditionRaw)
      .returning('id');
    console.log(result);

    // todo complete return value and use it.
    return true;
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
