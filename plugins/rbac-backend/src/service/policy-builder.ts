import {
  DatabaseManager,
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { RouterOptions } from '@backstage/plugin-permission-backend';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';

import { newEnforcer, newModelFromString } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import { PluginIdProvider } from '@janus-idp/backstage-plugin-rbac-node';

import { AuditLogger } from '../audit-log/audit-logger';
import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { DataBaseConditionalStorage } from '../database/conditional-storage';
import { migrate } from '../database/migration';
import { DataBasePolicyMetadataStorage } from '../database/policy-metadata-storage';
import { DataBaseRoleMetadataStorage } from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';
import { PolicesServer } from './policies-rest-api';

export class PolicyBuilder {
  public static async build(
    env: {
      config: Config;
      logger: Logger;
      discovery: PluginEndpointDiscovery;
      identity: IdentityApi;
      permissions: PermissionEvaluator;
      tokenManager: TokenManager;
    },
    pluginIdProvider: PluginIdProvider = { getPluginIds: () => [] },
  ): Promise<Router> {
    const databaseManager = DatabaseManager.fromConfig(env.config).forPlugin(
      'permission',
    );

    const adapter = await new CasbinDBAdapterFactory(
      env.config,
      databaseManager,
    ).createAdapter();

    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    await enf.loadPolicy();
    enf.enableAutoSave(true);

    const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
    const catalogDBClient = await DatabaseManager.fromConfig(env.config)
      .forPlugin('catalog')
      .getClient();
    const rm = new BackstageRoleManager(
      catalogClient,
      env.logger,
      env.tokenManager,
      catalogDBClient,
      env.config,
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    await migrate(databaseManager);
    const knex = await databaseManager.getClient();

    const auditLog = new AuditLogger(env.logger);
    const conditionStorage = new DataBaseConditionalStorage(knex);

    const policyMetadataStorage = new DataBasePolicyMetadataStorage(knex);
    const roleMetadataStorage = new DataBaseRoleMetadataStorage(knex);
    const enforcerDelegate = new EnforcerDelegate(
      enf,
      policyMetadataStorage,
      roleMetadataStorage,
      knex,
      auditLog,
    );

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      policy: await RBACPermissionPolicy.build(
        env.logger,
        env.config,
        conditionStorage,
        enforcerDelegate,
        roleMetadataStorage,
        policyMetadataStorage,
        knex,
      ),
    };

    const pluginIdsConfig = env.config.getOptionalStringArray(
      'permission.rbac.pluginsWithPermission',
    );
    if (pluginIdsConfig) {
      const pluginIds = new Set([
        ...pluginIdsConfig,
        ...pluginIdProvider.getPluginIds(),
      ]);
      pluginIdProvider.getPluginIds = () => {
        return [...pluginIds];
      };
    }

    const server = new PolicesServer(
      env.identity,
      env.permissions,
      options,
      enforcerDelegate,
      env.config,
      env.logger,
      env.discovery,
      conditionStorage,
      pluginIdProvider,
      roleMetadataStorage,
      auditLog,
    );
    return server.serve();
  }
}
