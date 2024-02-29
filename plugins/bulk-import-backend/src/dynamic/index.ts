/*
 * Copyright 2024 The Janus IDP Authors
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

import { HostDiscovery } from '@backstage/backend-app-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { CatalogClient } from '@backstage/catalog-client';

import { createRouter } from '../service/router';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'bulk-import',
    createPlugin: async env => {
      const catalogApi = new CatalogClient({
        discoveryApi: HostDiscovery.fromConfig(env.config),
      });
      return createRouter({
        ...env,
        catalogApi,
      });
    },
  },
};
