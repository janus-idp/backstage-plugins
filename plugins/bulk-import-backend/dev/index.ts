/*
 * Copyright 2024 The Janus IDP Authors
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

import {
  CacheManager,
  createServiceBuilder,
  DatabaseManager,
  getRootLogger,
  HostDiscovery,
  loadBackendConfig,
  ServerTokenManager,
  UrlReaders,
  useHotMemoize,
} from '@backstage/backend-common';
import { TaskScheduler } from '@backstage/backend-tasks';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';

import { Router } from 'express';
import { Logger } from 'winston';

import { Server } from 'http';

import { createRouter } from '../src/service/router';
import { PluginEnvironment } from './types';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
  catalogApi: CatalogApi;
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

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'bulk-import-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const discovery = HostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, {
    logger,
  });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });

  const createEnv = makeCreateEnv(config);
  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));

  const catalog = async (env: PluginEnvironment): Promise<Router> => {
    const builder = await CatalogBuilder.create(env);
    const { processingEngine, router } = await builder.build();
    await processingEngine.start();
    return router;
  };

  logger.debug('Starting application server...');
  const router = await createRouter({
    config,
    logger,
    permissions,
    catalogApi: options.catalogApi,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .enableCors({
      origin: '*',
    })
    .addRouter('/api/bulk-import', router)
    .addRouter('/api/catalog', await catalog(catalogEnv));
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error('Dev server failed:', err);
    process.exit(1);
  });
}

module.hot?.accept();
