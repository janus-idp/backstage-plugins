/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { tektonApiRef } from './api';
import { TektonBackendClient } from './api/TektonBackendClient';

export const rootRouteRef = createRouteRef({
  id: 'tekton-pipelines',
});

export const tektonPipelinesPluginPlugin = createPlugin({
  id: 'tekton-pipelines',
  apis: [
    createApiFactory({
      api: tektonApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new TektonBackendClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/*
export const TektonPipelinesPluginPage: () => JSX.Element = tektonPipelinesPluginPlugin.provide(
  createRoutableExtension({
    name: 'TektonPipelinesPluginPage',
    component: () =>
      import('./components/TektonDashboard').then(m => m.TektonDashboardComponent),
    mountPoint: rootRouteRef,
  }),
);
*/

/**
 * Props of EntityTektonPipelinesContentProps
 *
 * @public
 */
export type EntityTektonPipelinesContentProps = {
  /**
   * Sets the refresh interval in milliseconds. The default value is 10000 (10 seconds)
   */
  refreshIntervalMs?: number;
};

export const EntityTektonPipelinesContent: (
  props: EntityTektonPipelinesContentProps,
) => JSX.Element = tektonPipelinesPluginPlugin.provide(
  createRoutableExtension({
    name: 'EntityTektonPipelinesContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
