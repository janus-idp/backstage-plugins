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
import {
  AuthService,
  CacheService,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Context, OpenAPIBackend, Request } from 'openapi-backend';
import { Logger } from 'winston';

import {
  AuditLogger,
  DefaultAuditLogger,
} from '@janus-idp/backstage-plugin-audit-log-node';
import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

import {
  auditLogRequestError,
  auditLogRequestSuccess,
} from '../helpers/auditLogUtils';
import { permissionCheck } from '../helpers/auth';
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
import { findAllOrganizations } from './handlers/organizations';
import { ping } from './handlers/ping';
import {
  findAllRepositories,
  findRepositoriesByOrganization,
} from './handlers/repositories';

export interface RouterOptions {
  logger: Logger;
  permissions: PermissionEvaluator;
  config: Config;
  cache: CacheService;
  discovery: PluginEndpointDiscovery;
  identity: IdentityApi;
  httpAuth?: HttpAuthService;
  auth?: AuthService;
  catalogApi: CatalogApi;
  githubApi?: GithubApiService;
  catalogInfoHelper?: CatalogInfoGenerator;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    logger,
    permissions,
    config,
    cache,
    discovery,
    catalogApi,
    githubApi,
    catalogInfoHelper,
  } = options;

  const { auth, httpAuth } = createLegacyAuthAdapters(options);

  const auditLogger: AuditLogger = new DefaultAuditLogger({
    logger: logger,
    authService: auth,
    httpAuthService: httpAuth,
  });

  const githubApiService =
    githubApi ?? new GithubApiService(logger, config, cache);
  const catalogInfoGenerator =
    catalogInfoHelper ??
    new CatalogInfoGenerator(logger, discovery, auth, catalogApi);

  // create openapi requests handler
  const api = new OpenAPIBackend({
    ajvOpts: {
      verbose: true,
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    validate: true,
    definition: openApiDocument,
    handlers: {
      validationFail: async (c, _req: express.Request, res: express.Response) =>
        res.status(400).json({ err: c.validation.errors }),
      notFound: async (_c, req: express.Request, res: express.Response) =>
        res.status(404).json({ err: `'${req.method} ${req.path}' not found` }),
      notImplemented: async (_c, req: express.Request, res: express.Response) =>
        res
          .status(500)
          .json({ err: `'${req.method} ${req.path}' not implemented` }),
    },
  });

  await api.init();

  api.register(
    'ping',
    async (_c: Context, _req: express.Request, res: express.Response) => {
      const result = await ping(logger);
      return res.status(result.statusCode).json(result.responseBody);
    },
  );

  api.register(
    'findAllOrganizations',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.FindAllOrganizations.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      const response = await findAllOrganizations(
        logger,
        githubApiService,
        q.pagePerIntegration,
        q.sizePerIntegration,
      );
      return res.status(response.statusCode).json({
        errors: response.responseBody?.errors,
        organizations: response.responseBody?.organizations,
        totalCount: response.responseBody?.totalCount,
        pagePerIntegration: response.responseBody?.pagePerIntegration,
        sizePerIntegration: response.responseBody?.sizePerIntegration,
      } as Components.Schemas.OrganizationList);
    },
  );

  api.register(
    'findAllRepositories',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.FindAllRepositories.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      q.checkImportStatus = stringToBoolean(q.checkImportStatus);
      const response = await findAllRepositories(
        logger,
        config,
        githubApiService,
        catalogInfoGenerator,
        q.checkImportStatus,
        q.pagePerIntegration,
        q.sizePerIntegration,
      );
      const repos = response.responseBody?.repositories;
      return res.status(response.statusCode).json({
        errors: response.responseBody?.errors,
        repositories: repos,
        totalCount: response.responseBody?.totalCount,
        pagePerIntegration: q.pagePerIntegration,
        sizePerIntegration: q.sizePerIntegration,
      } as Components.Schemas.RepositoryList);
    },
  );

  api.register(
    'findRepositoriesByOrganization',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.FindRepositoriesByOrganization.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      q.checkImportStatus = stringToBoolean(q.checkImportStatus);
      const response = await findRepositoriesByOrganization(
        {
          logger,
          config,
          githubApiService,
          catalogInfoGenerator,
        },
        c.request.params.organizationName?.toString(),
        q.checkImportStatus,
        q.pagePerIntegration,
        q.sizePerIntegration,
      );
      const repos = response.responseBody?.repositories;
      return res.status(response.statusCode).json({
        errors: response.responseBody?.errors,
        repositories: repos,
        totalCount: response.responseBody?.totalCount,
        pagePerIntegration: q.pagePerIntegration,
        sizePerIntegration: q.sizePerIntegration,
      } as Components.Schemas.RepositoryList);
    },
  );

  api.register(
    'findAllImports',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.FindAllImports.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      const response = await findAllImports(
        logger,
        config,
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
      _req: express.Request,
      res: express.Response,
    ) => {
      const q: Paths.CreateImportJobs.QueryParameters = {
        ...c.request.query,
      };
      q.dryRun = stringToBoolean(q.dryRun);
      const response = await createImportJobs(
        logger,
        config,
        auth,
        catalogApi,
        githubApiService,
        catalogInfoGenerator,
        {
          importRequests: c.request.requestBody,
          dryRun: q.dryRun,
        },
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'findImportStatusByRepo',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.FindImportStatusByRepo.QueryParameters = {
        ...c.request.query,
      };
      if (!q.repo?.trim()) {
        throw new Error('missing or blank parameter');
      }
      const response = await findImportStatusByRepo(
        logger,
        config,
        githubApiService,
        catalogInfoGenerator,
        q.repo,
        q.defaultBranch,
        true,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'deleteImportByRepo',
    async (c: Context, _req: express.Request, res: express.Response) => {
      const q: Paths.DeleteImportByRepo.QueryParameters = {
        ...c.request.query,
      };
      if (!q.repo?.trim()) {
        throw new Error('missing or blank "repo" parameter');
      }
      const response = await deleteImportByRepo(
        logger,
        config,
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

  router.use(async (req, _res, next) => {
    if (req.path !== '/ping') {
      await permissionCheck(
        auditLogger,
        api.matchOperation(req as Request)?.operationId,
        permissions,
        httpAuth,
        req,
      );
    }
    next();
  });

  router.use(async (req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }
    const reqCast = req as Request;
    const operationId = api.matchOperation(reqCast)?.operationId;
    try {
      const response = (await api.handleRequest(
        reqCast,
        req,
        res,
      )) as express.Response;
      auditLogRequestSuccess(
        auditLogger,
        operationId,
        req,
        response.statusCode,
      );
    } catch (err: any) {
      auditLogRequestError(auditLogger, operationId, req, err);
      next(err);
    }
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
