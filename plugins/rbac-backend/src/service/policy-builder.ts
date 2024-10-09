import { DatabaseManager } from '@backstage/backend-defaults/database';
import type {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LifecycleService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import type { RouterOptions } from '@backstage/plugin-permission-backend';
import type { PermissionEvaluator } from '@backstage/plugin-permission-common';

import { newEnforcer, newModelFromString } from 'casbin';
import type { Router } from 'express';

import { DefaultAuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import type {
  PluginIdProvider,
  RBACProvider,
} from '@janus-idp/backstage-plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { DataBaseConditionalStorage } from '../database/conditional-storage';
import { migrate } from '../database/migration';
import { DataBaseRoleMetadataStorage } from '../database/role-metadata';
import { connectRBACProviders } from '../providers/connect-providers';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';

export class PolicyBuilder {
  public static async build(
    env: {
      config: Config;
      logger: LoggerService;
      discovery: DiscoveryService;
      permissions: PermissionEvaluator;
      auth: AuthService;
      httpAuth: HttpAuthService;
      userInfo: UserInfoService;
      lifecycle: LifecycleService;
    },
    pluginIdProvider: PluginIdProvider = { getPluginIds: () => [] },
    rbacProviders?: Array<RBACProvider>,
  ): Promise<Router> {
    const isPluginEnabled = env.config.getOptionalBoolean('permission.enabled');
    if (isPluginEnabled) {
      env.logger.info('RBAC backend plugin was enabled');
    } else {
      env.logger.warn(
        'RBAC backend plugin was disabled by application config permission.enabled: false',
      );
    }

    const databaseManager = DatabaseManager.fromConfig(env.config).forPlugin(
      'permission',
      { logger: env.logger, lifecycle: env.lifecycle },
    );

    const databaseClient = await databaseManager.getClient();

    const adapter = await new CasbinDBAdapterFactory(
      env.config,
      databaseClient,
    ).createAdapter();

    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    await enf.loadPolicy();
    enf.enableAutoSave(true);

    const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
    const catalogDBClient = await DatabaseManager.fromConfig(env.config)
      .forPlugin('catalog', { logger: env.logger, lifecycle: env.lifecycle })
      .getClient();

    const rm = new BackstageRoleManager(
      catalogClient,
      env.logger,
      catalogDBClient,
      databaseClient,
      env.config,
      env.auth,
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    await migrate(databaseManager);

    const conditionStorage = new DataBaseConditionalStorage(databaseClient);

    const roleMetadataStorage = new DataBaseRoleMetadataStorage(databaseClient);
    const enforcerDelegate = new EnforcerDelegate(
      enf,
      roleMetadataStorage,
      databaseClient,
    );

    const defAuditLog = new DefaultAuditLogger({
      logger: env.logger,
      authService: env.auth,
      httpAuthService: env.httpAuth,
    });

    if (rbacProviders) {
      await connectRBACProviders(
        rbacProviders,
        enforcerDelegate,
        roleMetadataStorage,
        env.logger,
        defAuditLog,
      );
    }

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

    const pluginPermMetaData = new PluginPermissionMetadataCollector(
      env.discovery,
      pluginIdProvider,
      env.logger,
      env.config,
    );

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      policy: await RBACPermissionPolicy.build(
        env.logger,
        defAuditLog,
        env.config,
        conditionStorage,
        enforcerDelegate,
        roleMetadataStorage,
        databaseClient,
        pluginPermMetaData,
        env.auth,
      ),
      auth: env.auth,
      httpAuth: env.httpAuth,
      userInfo: env.userInfo,
    };

    const server = new PoliciesServer(
      env.permissions,
      options,
      enforcerDelegate,
      env.config,
      env.httpAuth,
      env.auth,
      conditionStorage,
      pluginPermMetaData,
      roleMetadataStorage,
      defAuditLog,
      rbacProviders,
    );
    return server.serve();
  }
}
