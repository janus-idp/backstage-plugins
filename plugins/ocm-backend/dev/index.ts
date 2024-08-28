import { createBackend } from '@backstage/backend-defaults';

import { catalogModuleOCMEntityProvider, ocmPlugin } from '../src/';

const backend = createBackend();

// api endpoints from here: https://github.com/backstage/backstage/blob/master/plugins/catalog-backend/src/service/createRouter.ts
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(catalogModuleOCMEntityProvider);
backend.add(ocmPlugin);

backend.start();
