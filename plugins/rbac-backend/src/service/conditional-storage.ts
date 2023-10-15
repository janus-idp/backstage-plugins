import { PluginDatabaseManager } from '@backstage/backend-common';
import { InputError } from '@backstage/errors';
import {
  AuthorizeResult,
  ConditionalPolicyDecision,
} from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

const CONDITIONAL_TABLE = 'policy-conditions';

// dao
interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  pluginId: string;
  resourceType: string;
  conditionsJson: string;
}

export class ConditionalStorage {
  private knex?: Knex<any, any[]>;

  public constructor(private readonly databaseManager: PluginDatabaseManager) {}

  async init(): Promise<void> {
    const knex = await this.databaseManager.getClient();
    const exists = await knex.schema.hasTable('policy-conditions');

    // todo: remove it, I need it only for dev purposes.
    // if (exists) {
    //   await knex.schema.dropTable(CONDITIONAL_TABLE);
    // }

    if (!exists) {
      // todo: replace database creation with migration script.
      await knex.schema.createTable(CONDITIONAL_TABLE, table => {
        table.increments('id').primary();
        table.string('result');
        table.string('pluginId');
        table.string('resourceType');
        // Conditions is potentially long json
        table.text('conditionsJson');
        // Todo: think more and figure out:
        // instead of `text` we can use `json` or `jsonb` type, but this approach has pluses and minuses
        // table.json('conditions'); // or table.jsonb('conditions')
      });
    }

    this.knex = knex;
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

  // todo handle pluginId
  async findCondition(
    resourceType: string,
    _pluginId?: string,
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
