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
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';

import gitUrlParse from 'git-url-parse';
import jsYaml from 'js-yaml';
import fetch from 'node-fetch';
import { Logger } from 'winston';

import {
  DefaultPageNumber,
  DefaultPageSize,
} from '../service/handlers/handlers';
import { getTokenForPlugin } from './auth';

export class CatalogInfoGenerator {
  private readonly logger: Logger;
  private readonly discovery: PluginEndpointDiscovery;
  private readonly auth: AuthService;
  private readonly catalogApi: CatalogApi;

  constructor(
    logger: Logger,
    discovery: DiscoveryService,
    auth: AuthService,
    catalogApi: CatalogApi,
  ) {
    this.logger = logger;
    this.discovery = discovery;
    this.auth = auth;
    this.catalogApi = catalogApi;
  }

  async generateDefaultCatalogInfoContent(
    repoUrl: string,
    analyzeLocation: boolean = true,
  ): Promise<string> {
    const gitUrl = gitUrlParse(repoUrl);
    const defaultCatalogInfo = `---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${gitUrl.name}
  annotations:
    github.com/project-slug: ${gitUrl.organization}/${gitUrl.name}
spec:
  type: other
  lifecycle: unknown
  owner: ${gitUrl.organization}
---`;
    if (!analyzeLocation) {
      return defaultCatalogInfo;
    }

    let generatedEntities: any[] = [];
    try {
      const response = await fetch(
        `${await this.discovery.getBaseUrl('catalog')}/analyze-location`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getTokenForPlugin(this.auth, 'catalog')}`,
          },
          method: 'POST',
          body: JSON.stringify({
            location: {
              type: 'github',
              target: repoUrl,
            },
          }),
        },
      );
      generatedEntities = (await response.json()).generateEntities;
    } catch (error) {
      // fallback to the default catalog-info value
      this.logger.debug(`could not analyze location ${repoUrl}`, error);
    }

    if (generatedEntities.length === 0) {
      return defaultCatalogInfo;
    }

    return generatedEntities
      .map(
        generatedEntity => `---
${jsYaml.dump(generatedEntity.entity)}`,
      )
      .join('\n');
  }

  getCatalogUrl(
    config: Config,
    repoUrl: string,
    defaultBranch: string = 'main',
  ): string {
    return `${repoUrl}/blob/${defaultBranch}/${getCatalogFilename(config)}`;
  }

  async listCatalogUrlLocations(
    config: Config,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<string[]> {
    const list = await this.listCatalogUrlLocationsById(
      config,
      pageNumber,
      pageSize,
    );
    const result = new Set<string>();
    for (const l of list) {
      result.add(l.target);
    }
    return Array.from(result.values());
  }

  async listCatalogUrlLocationsById(
    config: Config,
    _pageNumber: number = DefaultPageNumber,
    _pageSize: number = DefaultPageSize,
  ): Promise<{ id?: string; target: string }[]> {
    const result = await Promise.all([
      this.listCatalogUrlLocationsFromConfig(config),
      this.listCatalogUrlLocationsByIdFromLocationsEndpoint(),
    ]);
    return result.flat();
  }

  async listCatalogUrlLocationsByIdFromLocationsEndpoint(): Promise<
    { id?: string; target: string }[]
  > {
    const url = `${await this.discovery.getBaseUrl('catalog')}/locations`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${await getTokenForPlugin(this.auth, 'catalog')}`,
      },
      method: 'GET',
    });
    const locations = (await response.json()) as {
      data: { id: string; target: string; type: string };
    }[];
    if (!Array.isArray(locations)) {
      return [];
    }
    return locations
      .filter(
        location => location.data?.target && location.data?.type === 'url',
      )
      .map(location => {
        return {
          id: location.data?.id,
          target: location.data.target,
        };
      });
  }

  listCatalogUrlLocationsFromConfig(
    config: Config,
  ): { id?: string; target: string }[] {
    const locationConfigs =
      config.getOptionalConfigArray('catalog.locations') ?? [];
    return locationConfigs
      .filter(
        location =>
          location.getOptionalString('target') &&
          location.getOptionalString('type') === 'url',
      )
      .map(location => {
        const target = location.getString('target');
        return {
          id: `app-config-location--${target}`,
          target,
        };
      });
  }

  async deleteCatalogLocationById(locationId: string): Promise<void> {
    try {
      const url = `${await this.discovery.getBaseUrl('catalog')}/locations/${locationId}`;
      await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${await getTokenForPlugin(this.auth, 'catalog')}`,
        },
        method: 'DELETE',
      });
    } catch (err: any) {
      this.logger.debug(
        `Could not delete location ${locationId}, cause: ${err}`,
      );
    }
  }

  async deleteCatalogLocationEntityById(locationUid: string): Promise<void> {
    await this.catalogApi.removeEntityByUid(locationUid, {
      token: await getTokenForPlugin(this.auth, 'catalog'),
    });
  }
}

export function getCatalogFilename(config: Config): string {
  return (
    config.getOptionalString('catalog.import.entityFilename') ??
    'catalog-info.yaml'
  );
}

export function getBranchName(config: Config): string {
  return (
    config.getOptionalString('catalog.import.pullRequestBranchName') ??
    'backstage-integration'
  );
}
