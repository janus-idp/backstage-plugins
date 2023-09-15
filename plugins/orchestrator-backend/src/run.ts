import {
  getRootLogger,
  HostDiscovery,
  loadBackendConfig,
  UrlReaders,
} from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { DefaultEventBroker } from '@backstage/plugin-events-backend';

import yn from 'yn';

import { startStandaloneServer } from '../dev';

const port = process.env.PLUGIN_PORT ? Number(process.env.PLUGIN_PORT) : 7007;
const enableCors = yn(process.env.PLUGIN_CORS, { default: false });
const logger = getRootLogger();
const config = await loadBackendConfig({ logger, argv: process.argv });
const eventBroker = new DefaultEventBroker(logger);
const discovery = HostDiscovery.fromConfig(config);
const catalogApi = new CatalogClient({
  discoveryApi: HostDiscovery.fromConfig(config),
});
const urlReader = UrlReaders.default({ logger, config });

startStandaloneServer({
  port,
  enableCors,
  logger,
  eventBroker,
  config,
  discovery,
  catalogApi,
  urlReader,
}).catch(err => {
  logger.error(err);
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('CTRL+C pressed; exiting.');
  process.exit(0);
});
