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

import request from 'supertest';

import {
  setupTest,
  startBackendServer,
} from '../../../../__fixtures__/testUtils';

describe('ping', () => {
  const useTestData = setupTest();

  describe('GET /ping', () => {
    it.each([
      ['anonymous', undefined],
      ['allowed', AuthorizeResult.ALLOW],
      ['denied', AuthorizeResult.DENY],
    ])(
      'should return ok when %s (auth result=%s)',
      async (_desc, authorizeResult?) => {
        const { mockCatalogClient } = useTestData();
        const backendServer = await startBackendServer(
          mockCatalogClient,
          authorizeResult as
            | AuthorizeResult.DENY
            | AuthorizeResult.ALLOW
            | undefined,
        );

        const response = await request(backendServer).get(
          '/api/bulk-import/ping',
        );

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ status: 'ok' });
      },
    );
  });
});
