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
import type { LoggerService } from '@backstage/backend-plugin-api';

import gitUrlParse from 'git-url-parse';
import jsYaml from 'js-yaml';

import { logErrorIfNeeded } from '../helpers';
import { CatalogHttpClient } from './catalogHttpClient';

export class CatalogInfoGenerator {
  private readonly logger: LoggerService;
  private readonly catalogHttpClient: CatalogHttpClient;

  constructor(logger: LoggerService, catalogHttpClient: CatalogHttpClient) {
    this.logger = logger;
    this.catalogHttpClient = catalogHttpClient;
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
      generatedEntities = await this.catalogHttpClient.analyzeLocation(repoUrl);
    } catch (error: any) {
      // fallback to the default catalog-info value
      logErrorIfNeeded(
        this.logger,
        `Could not analyze location ${repoUrl}`,
        error,
      );
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
}
