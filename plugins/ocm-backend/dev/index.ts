import { createServiceBuilder } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter, RouterOptions } from '../src/service/router';

export interface ServerOptions {
  port: number;
  logger: Logger;
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

module.hot?.accept();
