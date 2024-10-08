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

import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { rest } from 'msw';
import request from 'supertest';

import { LOCAL_ADDR } from '../../../../__fixtures__/handlers';
import {
  addHandlersForGHTokenAppErrors,
  setupTest,
  startBackendServer,
} from '../../../../__fixtures__/testUtils';

describe('organizations', () => {
  const useTestData = setupTest();

  describe('GET /organizations', () => {
    it('returns 200 when organizations are fetched without errors', async () => {
      const { mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        organizations: [
          {
            description: 'A great organization',
            errors: [],
            id: '1',
            name: 'github',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-1',
          },
          {
            description: 'A great organization',
            errors: [],
            id: '111',
            name: 'my-org-1',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-1',
          },
          {
            description: 'A second great organization',
            errors: [],
            id: '222',
            name: 'my-org-2',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-2',
          },
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 4,
      });
    });

    it('filters out organizations when a search query parameter is provided', async () => {
      const { mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations?search=octo',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        organizations: [
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 1,
      });
    });

    it('returns 200 with the errors in the body when organizations are fetched, but errors have occurred', async () => {
      const { server, mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );
      // change the response to 'GET /user/orgs'
      // to simulate an error retrieving list of orgs from GH Token.
      server.use(
        rest.get(`${LOCAL_ADDR}/user/orgs`, (_, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          );
        }),
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github Token auth did not succeed'],
        organizations: [
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 1,
      });
    });

    it('returns 500 when one or more errors are returned with no successful organization fetched', async () => {
      const { server, mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );
      // change the responses to simulate error retrieving list of orgs from all GH integrations.
      addHandlersForGHTokenAppErrors(server);

      const orgResp = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(orgResp.status).toEqual(500);
      expect(orgResp.body).toEqual({
        errors: [
          'Github App auth returned an error',
          'Github Token auth did not succeed',
        ],
      });
    });
  });
});
