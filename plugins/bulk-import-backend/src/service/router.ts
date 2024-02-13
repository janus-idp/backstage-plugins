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
import { Config } from '@backstage/config';
import { NotAllowedError } from '@backstage/errors';
import { getBearerTokenFromAuthorizationHeader } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

// TODO: move change this to @janus-idp/backstage-plugin-bulk-import-common when testing is complete. Don't forget to change the name field of the package.json of the bulk-import-common package as well
import { bulkImportPermission } from '@internal/backstage-plugin-bulk-import-common';
import express from 'express';
import Router from 'express-promise-router';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { GithubApiService } from './githubApiService';

export interface RouterOptions {
  logger: Logger;
  permissions: PermissionEvaluator;
  config: Config;
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
  const { logger, permissions, config } = options;

  const githubApiService = new GithubApiService(logger, config);

  const router = Router();
  router.use(express.json());

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [bulkImportPermission],
  });
  router.use(permissionIntegrationRouter);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // Using a POST instead of a GET with a param here because the `owner` field is expected to be a URL
  router.post('/repositories', async (req, res) => {
    const {
      body: { owner },
    } = req;
    let parsed: gitUrlParse.GitUrl;
    const token = getBearerTokenFromAuthorizationHeader(
      req.header('authorization'),
    );
    await permissionCheck(permissions, token);

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
    if (response.errors.length === 0 && response.repositories.length === 0) {
      res.status(404).json(response);
    } else if (response.errors.length === 0) {
      res.status(200).json(response);
    } else {
      // Return 207 since there is a variety of errors and potentially some partial successes
      res.status(207).json(response);
    }
  });

  router.use(errorHandler());

  return router;
}
