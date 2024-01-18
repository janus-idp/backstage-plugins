import { createServiceBuilder, HostDiscovery } from '@backstage/backend-common';
import { DiscoveryService } from '@backstage/backend-plugin-api';
import { Config, ConfigReader } from '@backstage/config';

import { createLogger, Logger, transports } from 'winston';

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
  const config: Config = new ConfigReader({});
  const discovery: DiscoveryService = HostDiscovery.fromConfig(config);
  const logger: Logger = createLogger({
    transports: [new transports.Console({ silent: true })],
  });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger: logger,
    config: config,
    discovery: discovery,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/feedback', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
