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

import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import type {
  AuthService,
  CacheService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import type { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { fullFormats } from 'ajv-formats/dist/formats';
import express, { Router, type Request, type Response } from 'express';
import {
  OpenAPIBackend,
  type Context,
  type Request as OpenAPIRequest,
} from 'openapi-backend';

import {
  DefaultAuditLogger,
  type AuditLogger,
} from '@janus-idp/backstage-plugin-audit-log-node';
import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

import { CatalogHttpClient } from '../catalog/catalogHttpClient';
import { CatalogInfoGenerator } from '../catalog/catalogInfoGenerator';
import type { Components, Paths } from '../generated/openapi.d';
import { openApiDocument } from '../generated/openapidocument';
import { GithubApiService } from '../github';
import { permissionCheck } from '../helpers';
import {
  auditLogRequestError,
  auditLogRequestSuccess,
} from '../helpers/auditLogUtils';
import {
  createImportJobs,
  deleteImportByRepo,
  findAllImports,
  findImportStatusByRepo,
} from './handlers/import';
import { findAllOrganizations } from './handlers/organization';
import { ping } from './handlers/ping';
import {
  findAllRepositories,
  findRepositoriesByOrganization,
} from './handlers/repository';

export interface RouterOptions {
  logger: LoggerService;
  permissions: PermissionEvaluator;
  config: Config;
  cache: CacheService;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  auth: AuthService;
  catalogApi: CatalogApi;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    logger,
    httpAuth,
    auth,
    permissions,
    config,
    cache,
    discovery,
    catalogApi,
  } = options;

  const auditLogger: AuditLogger = new DefaultAuditLogger({
    logger: logger,
    authService: auth,
    httpAuthService: httpAuth,
  });

  const githubApiService = new GithubApiService(logger, config, cache);
  const catalogHttpClient = new CatalogHttpClient({
    logger,
    config,
    discovery,
    auth,
    catalogApi,
  });
  const catalogInfoGenerator = new CatalogInfoGenerator(
    logger,
    catalogHttpClient,
  );

  // create openapi requests handler
  const api = new OpenAPIBackend({
    ajvOpts: {
      verbose: true,
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    validate: true,
    definition: openApiDocument,
    handlers: {
      validationFail: async (c, _req: Request, res: Response) =>
        res.status(400).json({ err: c.validation.errors }),
      notFound: async (_c, req: Request, res: Response) =>
        res.status(404).json({ err: `'${req.method} ${req.path}' not found` }),
      notImplemented: async (_c, req: Request, res: Response) =>
        res
          .status(500)
          .json({ err: `'${req.method} ${req.path}' not implemented` }),
    },
  });

  await api.init();

  api.register('ping', async (_c: Context, _req: Request, res: Response) => {
    const result = await ping(logger);
    return res.status(result.statusCode).json(result.responseBody);
  });

  api.register(
    'findAllOrganizations',
    async (c: Context, _req: Request, res: Response) => {
      const q: Paths.FindAllOrganizations.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      const response = await findAllOrganizations(
        logger,
        githubApiService,
        q.search,
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
    async (c: Context, _req: Request, res: Response) => {
      const q: Paths.FindAllRepositories.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pagePerIntegration = stringToNumber(q.pagePerIntegration);
      q.sizePerIntegration = stringToNumber(q.sizePerIntegration);
      q.checkImportStatus = stringToBoolean(q.checkImportStatus);
      const response = await findAllRepositories(
        {
          logger,
          config,
          githubApiService,
          catalogHttpClient,
        },
        {
          search: q.search,
          checkStatus: q.checkImportStatus,
          pageNumber: q.pagePerIntegration,
          pageSize: q.sizePerIntegration,
        },
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
    async (c: Context, _req: Request, res: Response) => {
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
          catalogHttpClient,
        },
        c.request.params.organizationName?.toString(),
        q.search,
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
    async (c: Context, _req: Request, res: Response) => {
      const h: Paths.FindAllImports.HeaderParameters = {
        ...c.request.headers,
      };
      const apiVersion = h['api-version'];
      const q: Paths.FindAllImports.QueryParameters = {
        ...c.request.query,
      };
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      let page: number | undefined;
      let size: number | undefined;
      if (apiVersion === undefined || apiVersion === 'v1') {
        // pagePerIntegration and sizePerIntegration deprecated in v1. 'page' and 'size' take precedence.
        page = stringToNumber(q.page || q.pagePerIntegration);
        size = stringToNumber(q.size || q.sizePerIntegration);
      } else {
        // pagePerIntegration and sizePerIntegration removed in v2+ and replaced by 'page' and 'size'.
        page = stringToNumber(q.page);
        size = stringToNumber(q.size);
      }
      const response = await findAllImports(
        {
          logger,
          config,
          githubApiService,
          catalogHttpClient,
        },
        {
          apiVersion,
        },
        {
          search: q.search,
          pageNumber: page,
          pageSize: size,
        },
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'createImportJobs',
    async (
      c: Context<Paths.CreateImportJobs.RequestBody>,
      _req: Request,
      res: Response,
    ) => {
      const q: Paths.CreateImportJobs.QueryParameters = {
        ...c.request.query,
      };
      q.dryRun = stringToBoolean(q.dryRun);
      const response = await createImportJobs(
        {
          logger,
          config,
          auth,
          catalogApi,
          githubApiService,
          catalogInfoGenerator,
          catalogHttpClient,
        },
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
    async (c: Context, _req: Request, res: Response) => {
      const q: Paths.FindImportStatusByRepo.QueryParameters = {
        ...c.request.query,
      };
      if (!q.repo?.trim()) {
        throw new Error('missing or blank parameter');
      }
      const response = await findImportStatusByRepo(
        {
          logger,
          config,
          githubApiService,
          catalogHttpClient,
        },
        q.repo,
        q.defaultBranch,
        true,
      );
      return res.status(response.statusCode).json(response.responseBody);
    },
  );

  api.register(
    'deleteImportByRepo',
    async (c: Context, _req: Request, res: Response) => {
      const q: Paths.DeleteImportByRepo.QueryParameters = {
        ...c.request.query,
      };
      if (!q.repo?.trim()) {
        throw new Error('missing or blank "repo" parameter');
      }
      const response = await deleteImportByRepo(
        {
          logger,
          config,
          githubApiService,
          catalogHttpClient,
        },
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
        api.matchOperation(req as OpenAPIRequest)?.operationId,
        permissions,
        httpAuth,
        req,
      ).catch(next);
    }
    next();
  });

  router.use(async (req, res, next) => {
    const reqCast = req as OpenAPIRequest;
    const operationId = api.matchOperation(reqCast)?.operationId;
    try {
      const response = (await api.handleRequest(reqCast, req, res)) as Response;
      auditLogRequestSuccess(
        auditLogger,
        operationId,
        req,
        response.statusCode,
      );
      next();
    } catch (err: any) {
      auditLogRequestError(auditLogger, operationId, req, err);
      next(err);
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

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
