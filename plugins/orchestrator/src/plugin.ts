import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { FEATURE_FLAG_DEVELOPER_MODE } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef, OrchestratorClient } from './api';
import { orchestratorRootRouteRef } from './routes';

export const orchestratorPlugin = createPlugin({
  id: 'orchestrator',
  apis: [
    createApiFactory({
      api: orchestratorApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory({ discoveryApi }) {
        return new OrchestratorClient({ discoveryApi });
      },
    }),
  ],
  routes: {
    root: orchestratorRootRouteRef,
  },
  featureFlags: [{ name: FEATURE_FLAG_DEVELOPER_MODE }],
});

export const OrchestratorPage = orchestratorPlugin.provide(
  createRoutableExtension({
    name: 'OrchestratorPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: orchestratorRootRouteRef,
  }),
);
