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

import {
  createLegacyAuthAdapters,
  errorHandler,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';
import { AuthService, HttpAuthService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import {
  getBearerTokenFromAuthorizationHeader,
  IdentityApi,
} from '@backstage/plugin-auth-node';
import {
  createPermission,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Context, OpenAPIBackend, Request } from 'openapi-backend';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../helpers/catalogInfoGenerator';
import { Components, Paths } from '../openapi.d';
import { openApiDocument } from '../openapidocument';
import { GithubApiService } from './githubApiService';
import {
  createImportJobs,
  deleteImportByRepo,
  findAllImports,
  findImportStatusByRepo,
} from './handlers/bulkImports';
import { ping } from './handlers/ping';
import { findAllRepositories } from './handlers/repositories';

import RepositoryList = Components.Schemas.RepositoryList;

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
  discovery: PluginEndpointDiscovery;
  identity: IdentityApi;
  httpAuth?: HttpAuthService;
  auth?: AuthService;
  catalogApi: CatalogApi;
}

/**
 * This will resolve to { result: AuthorizeResult.ALLOW } if the permission framework is disabled
 */
async function permissionCheck(
  _permissions: PermissionEvaluator,
  _token?: string,
) {
  // TODO(rm3l): Implement this properly as part of https://issues.redhat.com/browse/RHIDP-1208
  return;
  // const decision = (
  //   await permissions.authorizeConditional(
  //     [{ permission: bulkImportPermission }],
  //     {
  //       token,
  //     },
  //   )
  // )[0];
  //
  // if (decision.result === AuthorizeResult.DENY) {
  //   throw new NotAllowedError('Unauthorized');
  // }
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, permissions, config, discovery, catalogApi } = options;

  const { auth } = createLegacyAuthAdapters(options);

  const githubApiService = new GithubApiService(logger, config);
  const catalogInfoGenerator = new CatalogInfoGenerator(
    logger,
    discovery,
    auth,
  );

  // create openapi requests handler
  const api = new OpenAPIBackend({
    ajvOpts: {
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    validate: true,
    definition: openApiDocument,
  });

  await api.init();

  api.register(
    'ping',
    (_c: Context, _req: express.Request, res: express.Response) =>
      ping(logger).then(result =>
        res.status(result.statusCode).json(result.responseBody),
      ),
  );

  api.register(
    'findAllRepositories',
    async (c: Context, req: express.Request, res: express.Response) => {
      const backstageToken = getBearerTokenFromAuthorizationHeader(
        req.header('authorization'),
      );
      await permissionCheck(permissions, backstageToken);
      const q: Paths.FindAllRepositories.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      q.checkImportStatus = stringToBoolean(q.checkImportStatus);
      const response = await findAllRepositories(
        logger,
        githubApiService,
        catalogInfoGenerator,
        q.checkImportStatus,
        q.pagePerIntegration,
        q.sizePerIntegration,
      );
      // const paginated = paginate(response.responseBody?.repositories, q.page, q.size)
      const repos = response.responseBody?.repositories;
      return res.status(response.statusCode).json({
        errors: response.responseBody?.errors,
        repositories: repos,
        totalCount: response.responseBody?.totalCount,
        pagePerIntegration: q.pagePerIntegration,
        sizePerIntegration: q.sizePerIntegration,
      } as RepositoryList);
    },
  );

  api.register(
    'findAllImports',
    async (c: Context, req: express.Request, res: express.Response) => {
      const backstageToken = getBearerTokenFromAuthorizationHeader(
        req.header('authorization'),
      );
      await permissionCheck(permissions, backstageToken);
      const q: Paths.FindAllRepositories.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      const response = await findAllImports(
        logger,
        githubApiService,
        catalogInfoGenerator,
        q.pagePerIntegration,
        q.sizePerIntegration,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'createImportJobs',
    async (
      c: Context<Paths.CreateImportJobs.RequestBody>,
      req: express.Request,
      res: express.Response,
    ) => {
      const backstageToken = getBearerTokenFromAuthorizationHeader(
        req.header('authorization'),
      );
      await permissionCheck(permissions, backstageToken);
      const q: Paths.CreateImportJobs.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      q.dryRun = stringToBoolean(q.dryRun);
      const response = await createImportJobs(
        logger,
        config,
        auth,
        catalogApi,
        githubApiService,
        catalogInfoGenerator,
        c.request.requestBody,
        q.dryRun,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'findImportStatusByRepo',
    async (c: Context, req: express.Request, res: express.Response) => {
      const backstageToken = getBearerTokenFromAuthorizationHeader(
        req.header('authorization'),
      );
      await permissionCheck(permissions, backstageToken);
      const q: Paths.FindImportStatusByRepo.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      if (!q.repo || q.repo.trim().length === 0) {
        throw new Error('missing or blank parameter');
      }
      const response = await findImportStatusByRepo(
        logger,
        githubApiService,
        catalogInfoGenerator,
        q.repo,
        q.defaultBranch,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'deleteImportByRepo',
    async (c: Context, req: express.Request, res: express.Response) => {
      const backstageToken = getBearerTokenFromAuthorizationHeader(
        req.header('authorization'),
      );
      await permissionCheck(permissions, backstageToken);
      const q: Paths.DeleteImportByRepo.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      if (!q.repo || q.repo.trim().length === 0) {
        throw new Error('missing or blank "repo" parameter');
      }
      const response = await deleteImportByRepo(
        logger,
        githubApiService,
        catalogInfoGenerator,
        q.repo,
        q.defaultBranch,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  const router = Router();
  router.use(express.json());

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [bulkImportPermission],
  });
  router.use(permissionIntegrationRouter);

  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }
    const validation = api.validateRequest(req as Request);
    if (!validation.valid) {
      res.status(500).json({ status: 500, err: validation.errors });
      return;
    }

    api.handleRequest(req as Request, req, res).catch(next);
  });

  router.use(errorHandler());

  return router;
}

function stringToNumber(s: number | undefined): number | undefined {
  return s ? Number.parseInt(s.toString(), 10) : undefined;
}

function stringToBoolean(s: boolean | undefined): boolean | undefined {
  if (!s) {
    return undefined;
  }
  return s.toString() === 'true';
}
