import { createServiceBuilder } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';

import { Server } from 'http';

import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'rbac-backend' });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/rbac', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error('Standalone server failed:', err);
    process.exit(1);
  });
}

module.hot?.accept();
