import { createBackend } from '@backstage/backend-defaults';

import { catalogModuleAapResourceEntityProvider } from '../src/module';

const backend = createBackend();

// api endpoints from here: https://github.com/backstage/backstage/blob/master/plugins/catalog-backend/src/service/createRouter.ts
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(catalogModuleAapResourceEntityProvider);

backend.start();
