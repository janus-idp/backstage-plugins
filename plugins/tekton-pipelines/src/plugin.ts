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
import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

import { Entity } from '@backstage/catalog-model';

export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';

export const isTektonCiAvailable = (entity: Entity) =>Boolean(entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE]);

export const tektonPipelinesPluginPlugin = createPlugin({
  id: 'tekton-pipelines-plugin',
  routes: {
    root: rootRouteRef,
  },
});

export const TektonPipelinesPluginPage = tektonPipelinesPluginPlugin.provide(
  createRoutableExtension({
    name: 'TektonPipelinesPluginPage',
    component: () =>
      import('./components/TektonDashboard').then(m => m.TektonDashboardComponent),
    mountPoint: rootRouteRef,
  }),
);
