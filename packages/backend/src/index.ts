/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

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
import { TaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';

import Router from 'express-promise-router';

import { PluginEndpointCollector } from '@janus-idp/plugin-rh-rbac-backend';

import app from './plugins/app';
import auth from './plugins/auth';
import catalog from './plugins/catalog';
import permission from './plugins/permissions';
import proxy from './plugins/proxy';
import scaffolder from './plugins/scaffolder';
import search from './plugins/search';
import techdocs from './plugins/techdocs';
import { PluginEnvironment } from './types';

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  const discovery = SingleHostDiscovery.fromConfig(config);
  const cacheManager = CacheManager.fromConfig(config);
  const databaseManager = DatabaseManager.fromConfig(config, { logger: root });
  const tokenManager = ServerTokenManager.fromConfig(config, { logger: root });
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

async function main() {
  const config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const createEnv = makeCreateEnv(config);

  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const scaffolderEnv = useHotMemoize(module, () => createEnv('scaffolder'));
  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
  const techdocsEnv = useHotMemoize(module, () => createEnv('techdocs'));
  const searchEnv = useHotMemoize(module, () => createEnv('search'));
  const appEnv = useHotMemoize(module, () => createEnv('app'));
  const permissionEnv = useHotMemoize(module, () => createEnv('permission'));

  const apiRouter = Router();
  const pec = new PluginEndpointCollector();
  apiRouter.use(pec.add('/catalog'), await catalog(catalogEnv));
  apiRouter.use(pec.add('/scaffolder'), await scaffolder(scaffolderEnv));
  apiRouter.use(pec.add('/auth'), await auth(authEnv));
  apiRouter.use(pec.add('/techdocs'), await techdocs(techdocsEnv));
  apiRouter.use(pec.add('/proxy'), await proxy(proxyEnv));
  apiRouter.use(pec.add('/search'), await search(searchEnv));
  apiRouter.use(pec.add('/permission'), await permission(permissionEnv, pec));

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
main().catch(error => {
  console.error('Backend failed to start up', error);
  process.exit(1);
});
