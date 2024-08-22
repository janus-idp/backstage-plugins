import { createBackend } from '@backstage/backend-defaults';

import { catalogModuleKeycloakEntityProvider } from '../src/module/catalogModuleKeycloakEntityProvider';

const backend = createBackend();

// api endpoints from here: https://github.com/backstage/backstage/blob/master/plugins/catalog-backend/src/service/createRouter.ts
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(catalogModuleKeycloakEntityProvider);

backend.start();
