import {
  CacheManager,
  createServiceBuilder,
  DatabaseManager,
  getRootLogger,
  HostDiscovery,
  ServerTokenManager,
  UrlReaders,
  useHotMemoize,
} from '@backstage/backend-common';
import { TaskScheduler } from '@backstage/backend-tasks';
import { Config, ConfigReader } from '@backstage/config';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';

import { Router } from 'express';
import { Logger } from 'winston';

import { Server } from 'http';

import { ManagedClusterProvider } from '../src/';
import { createRouter, RouterOptions } from '../src/service/router';
import { PluginEnvironment } from './types';

export interface ServerOptions {
  port: number;
  logger: Logger;
}

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  const discovery = HostDiscovery.fromConfig(config);
  const cacheManager = CacheManager.fromConfig(config);
  const databaseManager = DatabaseManager.fromConfig(config, { logger: root });
  const tokenManager = ServerTokenManager.noop();
  const taskScheduler = TaskScheduler.fromConfig(config);

  const identity = DefaultIdentityClient.create({
    discovery,
  });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });

  root.info(`Created UrlReader ${reader}`);

  return (plugin: string): PluginEnvironment => {
    const logger = root.child({ type: 'plugin', plugin });
    const database = databaseManager.forPlugin(plugin);
    const cache = cacheManager.forPlugin(plugin);
    const scheduler = taskScheduler.forPlugin(plugin);
    return {
      logger,
      database,
      cache,
      config,
      reader,
      discovery,
      tokenManager,
      scheduler,
      permissions,
      identity,
    };
  };
}
const catalog = async (env: PluginEnvironment): Promise<Router> => {
  const builder = await CatalogBuilder.create(env);
  const ocm = ManagedClusterProvider.fromConfig(env.config, {
    logger: env.logger,
    schedule: env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 1 },
      timeout: { minutes: 1 },
    }),
  });
  builder.addEntityProvider(ocm);
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
};

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'ocm-backend',
  });

  logger.info('Starting application server...');
  const config = new ConfigReader({
    backend: {
      baseUrl: 'http://localhost:7007',
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
    catalog: {
      providers: {
        ocm: {
          hub: {
            name: 'foo',
            url: 'http://localhost:5000',
            serviceAccountToken: 'TOKEN',
          },
        },
      },
    },
  });
  const createEnv = makeCreateEnv(config);
  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));

  const ocmRouterOptions: RouterOptions = { logger, config };
  const service = createServiceBuilder(module)
    .setPort(options.port)
    .enableCors({
      origin: '*',
    })
    .addRouter('/api/ocm', await createRouter(ocmRouterOptions))
    .addRouter('/catalog', await catalog(catalogEnv));

  return await service.start().catch(err => {
    logger.error('Dev server failed:', err);
    process.exit(1);
  });
}

module.hot?.accept();
