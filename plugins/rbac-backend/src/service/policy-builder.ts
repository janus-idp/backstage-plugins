import {
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { RouterOptions } from '@backstage/plugin-permission-backend';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';

import { FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import { CasbinDBAdapterFactory } from './casbin-adapter-factory';
import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';
import { PolicesServer } from './policies-rest-api';

export class PolicyBuilder {
  public static async build(env: {
    config: Config;
    logger: Logger;
    discovery: PluginEndpointDiscovery;
    identity: IdentityApi;
    permissions: PermissionEvaluator;
    database: PluginDatabaseManager;
  }): Promise<Router> {
    let adapter;
    const databaseEnabled = env.config.getOptionalBoolean(
      'permission.rbac.database.enabled',
    );
    // Database adapter work
    if (databaseEnabled) {
      adapter = await new CasbinDBAdapterFactory(
        env.config,
        env.database,
      ).createAdapter();
    } else {
      adapter = new FileAdapter(
        resolvePackagePath(
          '@janus-idp/backstage-plugin-rbac-backend',
          './model/rbac-policy.csv',
        ),
      );
    }

    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    await enf.loadPolicy();
    enf.enableAutoSave(true);

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      policy: await RBACPermissionPolicy.build(env.logger, env.config, enf),
    };

    const server = new PolicesServer(
      env.identity,
      env.permissions,
      options,
      enf,
    );
    return server.serve();
  }
}
