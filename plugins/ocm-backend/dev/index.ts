import {
  CacheManager,
  createServiceBuilder,
  DatabaseManager,
  getRootLogger,
  loadBackendConfig,
  notFoundHandler,
  ServerTokenManager,
  SingleHostDiscovery,
  UrlReaders,
  useHotMemoize,
} from '@backstage/backend-common';
import { Config, ConfigReader } from '@backstage/config';
import catalog from './plugins/catalog';
import { Logger } from 'winston';

import { Server } from 'http';

import { createRouter, RouterOptions } from '../src/service/router';
import { Router } from 'express';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { TaskScheduler } from '@backstage/backend-tasks';
import { PluginEnvironment } from './types';
import scaffolder from './plugins/scaffolder';
import ocm from './plugins/ocm';
import auth from './plugins/auth';
import proxy from './plugins/proxy';
import app from './plugins/app';

export interface ServerOptions {
  port: number;
  logger: Logger;
}

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  const discovery = SingleHostDiscovery.fromConfig(config);
  const cacheManager = CacheManager.fromConfig(config);
  const databaseManager = DatabaseManager.fromConfig(config, { logger: root });
  const tokenManager = ServerTokenManager.noop();
  const taskScheduler = TaskScheduler.fromConfig(config);

  const identity = DefaultIdentityClient.create({
    discovery,
  });

  root.info(`Created UrlReader ${reader}`);

  return (plugin: string): PluginEnvironment => {
    const logger = root.child({ type: 'plugin', plugin });
    const database = databaseManager.forPlugin(plugin);
    const cache = cacheManager.forPlugin(plugin);
    const scheduler = taskScheduler.forPlugin(plugin);
    const permissions = ServerPermissionClient.fromConfig(config, {
      discovery,
      tokenManager,
    });
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

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'ocm-backend',
  });

  logger.info('Starting application server...');
  const config = new ConfigReader({
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
  const routerOptions: RouterOptions = { logger, config };
  const service = createServiceBuilder(module)
    .setPort(options.port)
    .enableCors({
      origin: '*',
    })
    .addRouter('/api/ocm', await createRouter(routerOptions));

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

export async function startBackend() {
  const config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const createEnv = makeCreateEnv(config);

  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const scaffolderEnv = useHotMemoize(module, () => createEnv('scaffolder'));
  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
  const appEnv = useHotMemoize(module, () => createEnv('app'));
  const ocmEnv = useHotMemoize(module, () => createEnv('ocm'));

  const apiRouter = Router();
  apiRouter.use('/catalog', await catalog(catalogEnv));
  apiRouter.use('/scaffolder', await scaffolder(scaffolderEnv));
  apiRouter.use('/auth', await auth(authEnv));
  apiRouter.use('/proxy', await proxy(proxyEnv));
  apiRouter.use('/ocm', await ocm(ocmEnv));

  // Add backends ABOVE this line; this 404 handler is the catch-all fallback
  apiRouter.use(notFoundHandler());

  const service = createServiceBuilder(module)
    .loadConfig(config)
    .addRouter('/api', apiRouter)
    .addRouter('', await app(appEnv));

  await service.start().catch(err => {
    console.log(err);
    process.exit(1);
  });
}

module.hot?.accept();
