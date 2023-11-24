import { createServiceBuilder, HostDiscovery } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';

import { Logger } from 'winston';

import { Server } from 'http';

import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'kiali-backend' });
  const config = new ConfigReader({});
  const catalogApi = new CatalogClient({
    discoveryApi: HostDiscovery.fromConfig(config),
  });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    config,
    catalogApi,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/kiali', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error('Standalone server failed:', err);
    process.exit(1);
  });
}

module.hot?.accept();
