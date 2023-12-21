/*
 * Copyright 2022 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import KcAdminClient from '@keycloak/keycloak-admin-client';
import type { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { merge } from 'lodash';
import * as uuid from 'uuid';
import { Logger } from 'winston';

import {
  GroupTransformer,
  KEYCLOAK_ID_ANNOTATION,
  KeycloakProviderConfig,
  UserTransformer,
} from '../lib';
import { readProviderConfigs } from '../lib/config';
import { readKeycloakRealm } from '../lib/read';

/**
 * Options for {@link KeycloakOrgEntityProvider}.
 *
 * @public
 */
export interface KeycloakOrgEntityProviderOptions {
  /**
   * A unique, stable identifier for this provider.
   *
   * @example "production"
   */
  id: string;

  /**
   * The refresh schedule to use.
   *
   * @defaultValue "manual"
   * @remarks
   *
   * If you pass in 'manual', you are responsible for calling the `read` method
   * manually at some interval.
   *
   * But more commonly you will pass in the result of
   * {@link @backstage/backend-tasks#PluginTaskScheduler.createScheduledTaskRunner}
   * to enable automatic scheduling of tasks.
   */
  schedule?: 'manual' | TaskRunner;

  /**
   * Scheduler used to schedule refreshes based on
   * the schedule config.
   */
  scheduler?: PluginTaskScheduler;

  /**
   * The logger to use.
   */
  logger: Logger;

  /**
   * The function that transforms a user entry in LDAP to an entity.
   */
  userTransformer?: UserTransformer;

  /**
   * The function that transforms a group entry in LDAP to an entity.
   */
  groupTransformer?: GroupTransformer;
}

// Makes sure that emitted entities have a proper location
export const withLocations = (
  baseUrl: string,
  realm: string,
  entity: Entity,
): Entity => {
  const kind = entity.kind === 'Group' ? 'groups' : 'users';
  const location = `url:${baseUrl}/admin/realms/${realm}/${kind}/${entity.metadata.annotations?.[KEYCLOAK_ID_ANNOTATION]}`;
  return merge(
    {
      metadata: {
        annotations: {
          [ANNOTATION_LOCATION]: location,
          [ANNOTATION_ORIGIN_LOCATION]: location,
        },
      },
    },
    entity,
  ) as Entity;
};

/**
 * Ingests org data (users and groups) from GitHub.
 *
 * @public
 */
export class KeycloakOrgEntityProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private scheduleFn?: () => Promise<void>;

  static fromConfig(
    configRoot: Config,
    options: KeycloakOrgEntityProviderOptions,
  ): KeycloakOrgEntityProvider[] {
    return readProviderConfigs(configRoot).map(providerConfig => {
      let taskRunner;
      if (options.scheduler && providerConfig.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if (options.schedule) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        throw new Error(
          `No schedule provided neither via code nor config for KeycloakOrgEntityProvider:${providerConfig.id}.`,
        );
      }

      const provider = new KeycloakOrgEntityProvider({
        id: providerConfig.id,
        provider: providerConfig,
        logger: options.logger,
        userTransformer: options.userTransformer,
        groupTransformer: options.groupTransformer,
      });

      if (taskRunner !== 'manual') {
        provider.schedule(taskRunner);
      }

      return provider;
    });
  }

  constructor(
    private options: {
      id: string;
      provider: KeycloakProviderConfig;
      logger: Logger;
      userTransformer?: UserTransformer;
      groupTransformer?: GroupTransformer;
    },
  ) {}

  getProviderName(): string {
    return `KeycloakOrgEntityProvider:${this.options.id}`;
  }

  async connect(connection: EntityProviderConnection) {
    this.connection = connection;
    await this.scheduleFn?.();
  }

  /**
   * Runs one complete ingestion loop. Call this method regularly at some
   * appropriate cadence.
   */
  async read(options?: { logger?: Logger }) {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const logger = options?.logger ?? this.options.logger;
    const provider = this.options.provider;

    const { markReadComplete } = trackProgress(logger);
    const kcAdminClient = new KcAdminClient({
      baseUrl: provider.baseUrl,
      realmName: provider.loginRealm,
    });

    let credentials: Credentials;

    if (provider.username && provider.password) {
      credentials = {
        grantType: 'password',
        clientId: provider.clientId ?? 'admin-cli',
        username: provider.username,
        password: provider.password,
      };
    } else if (provider.clientId && provider.clientSecret) {
      credentials = {
        grantType: 'client_credentials',
        clientId: provider.clientId,
        clientSecret: provider.clientSecret,
      };
    } else {
      throw new Error(
        `username and password or clientId and clientSecret must be provided.`,
      );
    }

    await kcAdminClient.auth(credentials);

    const { users, groups } = await readKeycloakRealm(kcAdminClient, provider, {
      userQuerySize: provider.userQuerySize,
      groupQuerySize: provider.groupQuerySize,
      userTransformer: this.options.userTransformer,
      groupTransformer: this.options.groupTransformer,
    });

    const { markCommitComplete } = markReadComplete({ users, groups });

    await this.connection.applyMutation({
      type: 'full',
      entities: [...users, ...groups].map(entity => ({
        locationKey: `keycloak-org-provider:${this.options.id}`,
        entity: withLocations(provider.baseUrl, provider.realm, entity),
      })),
    });

    markCommitComplete();
  }

  schedule(taskRunner: TaskRunner) {
    this.scheduleFn = async () => {
      const id = `${this.getProviderName()}:refresh`;
      await taskRunner.run({
        id,
        fn: async () => {
          const logger = this.options.logger.child({
            class: KeycloakOrgEntityProvider.prototype.constructor.name,
            taskId: id,
            taskInstanceId: uuid.v4(),
          });

          try {
            await this.read({ logger });
          } catch (error: any) {
            // Ensure that we don't log any sensitive internal data:
            logger.error('Error while syncing Keycloak users and groups', {
              // Default Error properties:
              name: error.name,
              message: error.message,
              stack: error.stack,
              // Additional status code if available:
              status: error.response?.status,
            });
          }
        },
      });
    };
  }
}

// Helps wrap the timing and logging behaviors
function trackProgress(logger: Logger) {
  let timestamp = Date.now();
  let summary: string;

  logger.info('Reading Keycloak users and groups');

  function markReadComplete(read: { users: unknown[]; groups: unknown[] }) {
    summary = `${read.users.length} Keycloak users and ${read.groups.length} Keycloak groups`;
    const readDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    timestamp = Date.now();
    logger.info(`Read ${summary} in ${readDuration} seconds. Committing...`);
    return { markCommitComplete };
  }

  function markCommitComplete() {
    const commitDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    logger.info(`Committed ${summary} in ${commitDuration} seconds.`);
  }

  return { markReadComplete };
}
