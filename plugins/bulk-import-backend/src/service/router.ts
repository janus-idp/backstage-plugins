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

import { errorHandler } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { NotAllowedError } from '@backstage/errors';
import { getBearerTokenFromAuthorizationHeader } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  createPermission,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

// import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';
import express from 'express';
import Router from 'express-promise-router';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import crypto from 'crypto';

import { CatalogInfoGenerator } from '../helpers/catalogInfoGenerator';
import { GithubApiService } from './githubApiService';

// TODO: Remove this when done to use the @janus-idp/backstage-plugin-bulk-import-common import instead
/** This permission is used to access the bulk-import endpoints
 * @public
 */
export const bulkImportPermission = createPermission({
  name: 'bulk-import',
  attributes: {},
  resourceType: 'bulk-import',
});

export interface RouterOptions {
  logger: Logger;
  permissions: PermissionEvaluator;
  config: Config;
  catalogApi: CatalogApi;
}

/**
 * This will resolve to { result: AuthorizeResult.ALLOW } if the permission framework is disabled
 */
async function permissionCheck(
  permissions: PermissionEvaluator,
  token?: string,
) {
  const decision = (
    await permissions.authorizeConditional(
      [{ permission: bulkImportPermission }],
      {
        token,
      },
    )
  )[0];

  if (decision.result === AuthorizeResult.DENY) {
    throw new NotAllowedError('Unauthorized');
  }
}
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, permissions, config, catalogApi } = options;

  const githubApiService = new GithubApiService(logger, config);
  const catalogInfoGenerator = new CatalogInfoGenerator(logger, catalogApi);

  const router = Router();
  router.use(express.json());

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [bulkImportPermission],
  });
  router.use(permissionIntegrationRouter);

  async function verifyLocationExistence(
    repo_catalog_url: string,
    backstage_token?: string,
  ): Promise<boolean> {
    const result = await options.catalogApi.addLocation(
      {
        type: 'url',
        target: repo_catalog_url,
        dryRun: true,
      },
      { token: backstage_token },
    );
    // The `result.exists` field is only filled in dryRun mode
    return result.exists as boolean;
  }

  router.get('/health', (_, res) => {
    logger.info('PONG!');
    res.json({ status: 'ok' });
  });

  // Using a POST instead of a GET with a param here because the `owner` field is expected to be a URL
  router.post('/repositories', async (req, res) => {
    const {
      body: { owner },
    } = req;
    let parsed: gitUrlParse.GitUrl;
    const backstageToken = getBearerTokenFromAuthorizationHeader(
      req.header('authorization'),
    );
    await permissionCheck(permissions, backstageToken);

    if (!owner) {
      res.status(400).send({
        error:
          'No owner field provided. Please provide a valid github URL to the user or organization.',
      });
      return;
    }
    try {
      parsed = gitUrlParse(owner);
    } catch {
      res.status(400).send({
        error:
          'Invalid owner field provided. Please provide a valid github URL to the user or organization.',
      });
      return;
    }
    const response = await githubApiService.getGithubRepositories(parsed);

    const batchBulkImportUUID = crypto.randomUUID();
    /**
     * Check if corresponding repository already has an existing catalog location
     * Assumes that the catalog file is located in the root directory of the default_branch
     * Generates a Component entity and Location entity by default if repo doesn't exist already in the catalog
     */
    const modifiedResponse = {
      ...response,
      repositories: await Promise.all(
        response.repositories.map(async repo => {
          const catalogUrl = `${repo.html_url}/blob/${repo.default_branch}/catalog-info.yaml`;
          const repoExists = await verifyLocationExistence(
            catalogUrl,
            backstageToken,
          );
          if (!repoExists) {
            const entities =
              await catalogInfoGenerator.createCatalogInfoGenerator({
                repoInfo: repo,
                backstageToken,
                bulkImportUUID: batchBulkImportUUID,
              });
            return {
              ...repo,
              locationEntity: entities.locationEntity,
              entity: entities.entity,
            };
          }
          return {
            ...repo,
            exists: repoExists,
          };
        }),
      ),
    };

    if (
      modifiedResponse.errors.length === 0 &&
      modifiedResponse.repositories.length === 0
    ) {
      res.status(404).json(modifiedResponse);
    } else if (response.errors.length === 0) {
      res.status(200).json(modifiedResponse);
    } else {
      // Return 207 since there is a variety of errors and potentially some partial successes
      res.status(207).json(modifiedResponse);
    }
  });
  router.post('/edit-catalog-info', async (req, res) => {
    const {
      body: { entityRef },
    } = req;

    const backstageToken = getBearerTokenFromAuthorizationHeader(
      req.header('authorization'),
    );
    await permissionCheck(permissions, backstageToken);
    // TODO: add catalog-info editing endpoint
    res.json(entityRef);
  });

  router.use(errorHandler());

  return router;
}
