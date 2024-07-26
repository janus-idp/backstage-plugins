import { createLegacyAuthAdapters } from '@backstage/backend-common';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  SchedulerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

import express from 'express';

import { DevModeService } from '../service/DevModeService';
import { createBackendRouter } from '../service/router';

export interface RouterOptions {
  config: Config;
  logger: LoggerService;
  discovery: DiscoveryService;
  catalogApi: CatalogApi;
  urlReader: UrlReaderService;
  scheduler: SchedulerService;
  permissions: PermissionsService;
  httpAuth?: HttpAuthService;
  auth?: AuthService;
}

export async function createRouter(args: RouterOptions): Promise<express.Router> {
  const autoStartDevMode =
    args.config.getOptionalBoolean(
      'orchestrator.sonataFlowService.autoStart',
    ) ?? false;

  if (autoStartDevMode) {
    const devModeService = new DevModeService(args.config, args.logger);

    const isSonataFlowUp = await devModeService.launchDevMode();

    if (!isSonataFlowUp) {
      args.logger.error('SonataFlow is not up. Check your configuration.');
    }
  }

  const { auth, httpAuth } = createLegacyAuthAdapters({
    httpAuth: args.httpAuth,
    discovery: args.discovery,
    auth: args.auth,
  });
  return await createBackendRouter({
    config: args.config,
    logger: args.logger,
    discovery: args.discovery,
    catalogApi: args.catalogApi,
    urlReader: args.urlReader,
    scheduler: args.scheduler,
    permissions: args.permissions,
    httpAuth: httpAuth,
    auth: auth,
  });
}
