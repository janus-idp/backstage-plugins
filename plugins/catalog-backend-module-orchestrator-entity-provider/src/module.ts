import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { DefaultEventBroker } from '@backstage/plugin-events-backend';

import { OrchestratorEntityProvider } from './OrchestratorEntityProvider';

export const orchestratorModuleEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'orchestrator-entity-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, discovery, scheduler, catalog }) {
        const winstonLogger = loggerToWinstonLogger(logger);
        const eventBroker = new DefaultEventBroker(winstonLogger);
        const provider = await OrchestratorEntityProvider.fromConfig({
          config,
          discovery,
          logger: winstonLogger,
          scheduler,
        });
        eventBroker.subscribe(provider);
        catalog.addEntityProvider(provider);
      },
    });
  },
});
