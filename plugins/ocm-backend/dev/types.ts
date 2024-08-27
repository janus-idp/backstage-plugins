import { PluginCacheManager } from '@backstage/backend-common';
import type {
  DatabaseService,
  DiscoveryService,
  LoggerService,
  SchedulerService,
  TokenManagerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import type { IdentityApi } from '@backstage/plugin-auth-node';
import type { PermissionEvaluator } from '@backstage/plugin-permission-common';
import type { PluginCacheManager } from '@backstage/backend-defaults';

export type PluginEnvironment = {
  logger: LoggerService;
  database: DatabaseService;
  cache: PluginCacheManager;
  config: Config;
  reader: UrlReaderService;
  discovery: DiscoveryService;
  tokenManager: TokenManagerService;
  scheduler: SchedulerService;
  permissions: PermissionEvaluator;
  identity: IdentityApi;
};
