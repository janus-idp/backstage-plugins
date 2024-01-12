import { UrlReader } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { EventBroker } from '@backstage/plugin-events-node';

import express from 'express';
import { Logger } from 'winston';

import { DataIndexService } from '../service/DataIndexService';
import { createBackendRouter } from '../service/router';
import { SonataFlowService } from '../service/SonataFlowService';

export interface RouterArgs {
  eventBroker: EventBroker;
  config: Config;
  logger: Logger;
  discovery: DiscoveryApi;
  catalogApi: CatalogApi;
  urlReader: UrlReader;
}

export async function createRouter(args: RouterArgs): Promise<express.Router> {
  const dataIndexService = initDataIndexService(args.logger, args.config);
  const sonataFlowService = new SonataFlowService(
    args.config,
    dataIndexService,
    args.logger,
  );

  const router = await createBackendRouter({
    eventBroker: args.eventBroker,
    config: args.config,
    logger: args.logger,
    discovery: args.discovery,
    catalogApi: args.catalogApi,
    urlReader: args.urlReader,
    sonataFlowService,
    dataIndexService,
  });

  const isSonataFlowUp = await sonataFlowService.connect();

  if (!isSonataFlowUp) {
    args.logger.error('SonataFlow is not up. Check your configuration.');
  }

  return router;
}

function initDataIndexService(
  logger: Logger,
  config: Config,
): DataIndexService {
  const dataIndexUrl = config.getString('orchestrator.dataIndexService.url');
  return new DataIndexService(dataIndexUrl, logger);
}
