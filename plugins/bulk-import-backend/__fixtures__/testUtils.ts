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

import {DEFAULT_TEST_HANDLERS, LOCAL_ADDR} from "./handlers";
import crypto from "crypto";
import {rest} from "msw";
import {AuthorizeResult} from "@backstage/plugin-permission-common";
import {BackendFeature, createServiceFactory} from "@backstage/backend-plugin-api";
import {bulkImportPlugin} from "../src/plugin";
import {mockServices, startTestBackend} from "@backstage/backend-test-utils";
import {catalogServiceRef} from "@backstage/plugin-catalog-node/alpha";
import {setupServer, SetupServer} from "msw/node";
import type {CatalogClient} from "@backstage/catalog-client";

const BASE_CONFIG = {
    app: {
        baseUrl: 'https://my-backstage-app.example.com',
    },
    integrations: {
        github: [
            {
                host: 'github.com',
                apiBaseUrl: LOCAL_ADDR,
                rawBaseUrl: `${LOCAL_ADDR}/raw`,
                token: 'my_super_secret_gh_token', // notsecret
            },
            {
                host: 'enterprise.github.com',
                apiBaseUrl: LOCAL_ADDR,
                rawBaseUrl: `${LOCAL_ADDR}/raw`,
                apps: [
                    {
                        appId: 1234567890,
                        clientId: 'my-client-id', // notsecret
                        clientSecret: 'my-client-secret', // notsecret
                        webhookSecret: 'my-webhook-secret', // notsecret
                        privateKey: crypto.generateKeyPairSync('rsa', {
                            modulusLength: 2048,
                            publicKeyEncoding: { type: 'spki', format: 'pem' },
                            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
                        }).privateKey,
                    },
                ],
            },
        ],
    },
    catalog: {
        locations: [
            {
                type: 'url',
                // import status should be ADDED because it contains a catalog-info.yaml in its default branch
                target:
                    'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/catalog-info.yaml',
            },
            {
                type: 'url',
                // same repo but with path not to the root of the repo => will be ignored
                target:
                    'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/path/to/some/other/component/catalog-info.yaml',
            },
            {
                type: 'url',
                // import status should be WAIT_PR_APPROVAL because it does not contain a catalog-info.yaml in its default branch but has an import PR open
                target:
                    'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/blob/main/catalog-info.yaml',
            },
            {
                type: 'url',
                // import status should be null because it does not contain a catalog-info.yaml in its default branch and has no an import PR open
                target:
                    'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr/blob/main/catalog-info.yaml',
            },
            {
                type: 'url',
                // Location not considered as Import job
                target:
                    'https://github.com/my-org-3/another-repo/blob/main/some/path/to/my-component.yaml',
            },
        ],
    },
};

export function addHandlersForGHTokenAppErrors(server: SetupServer) {
    server.use(
        rest.get(`${LOCAL_ADDR}/user/orgs`, (_, res, ctx) =>
            res(
                ctx.status(500),
                ctx.json({ message: 'Github Token auth did not succeed' }),
            ),
        ),
        rest.get(`${LOCAL_ADDR}/app/installations`, (_, res, ctx) =>
            res(
                ctx.status(403),
                ctx.json({ message: 'Github App auth returned an error' }),
            ),
        ),
        rest.get(`${LOCAL_ADDR}/user/repos`, (_, res, ctx) =>
            res(
                ctx.status(401),
                ctx.json({ message: 'Github Token auth did not succeed' }),
            ),
        ),
        rest.get(`${LOCAL_ADDR}/orgs/some-org/repos`, (_, res, ctx) =>
            res(
                ctx.status(502),
                ctx.json({ message: 'Github Token auth did not succeed' }),
            ),
        ),
    );
}

export async function startBackendServer(
    mockCatalogClient: CatalogClient,
    authorizeResult?: AuthorizeResult.DENY | AuthorizeResult.ALLOW,
    config?: any,
): Promise<any> {
    const features: (BackendFeature | Promise<{ default: BackendFeature }>)[] =
        [
            bulkImportPlugin,
            mockServices.rootLogger.factory,
            mockServices.rootConfig.factory({
                data: { ...BASE_CONFIG, ...(config || {}) },
            }),
            mockServices.cache.factory,
            createServiceFactory({
                service: catalogServiceRef,
                deps: {},
                factory: () => mockCatalogClient,
            }),
        ];
    if (authorizeResult) {
        features.push(
            mockServices.permissions.mock({
                authorize: async () => [{ result: authorizeResult }],
            }).factory,
        );
    }
    return (await startTestBackend({ features })).server;
}

export function setupTest() {
    let server: SetupServer;
    let mockCatalogClient: CatalogClient;

    beforeAll(() => {
        server = setupServer(...DEFAULT_TEST_HANDLERS);
        server.listen({
            /*
             *  This is required so that msw doesn't throw
             *  warnings when the backend is requesting an endpoint
             */
            onUnhandledRequest: (req, print) => {
                if (req.url.pathname.startsWith('/api/bulk-import')) {
                    // bypass
                    return;
                }
                print.warning();
            },
        });
    });

    afterAll(() => server.close());

    beforeEach(() => {
        // TODO(rm3l): Use 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
        //  once '@backstage/plugin-catalog-node' is upgraded
        mockCatalogClient = {
            getEntities: jest.fn(),
            getEntitiesByRefs: jest.fn(),
            queryEntities: jest.fn(),
            getEntityAncestors: jest.fn(),
            getEntityByRef: jest.fn(),
            removeEntityByUid: jest.fn(),
            refreshEntity: jest.fn(),
            getEntityFacets: jest.fn(),
            getLocationById: jest.fn(),
            getLocationByRef: jest.fn(),
            addLocation: jest.fn(),
            removeLocationById: jest.fn(),
            getLocationByEntity: jest.fn(),
            validateEntity: jest.fn(),
        } as unknown as CatalogClient;
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        server.resetHandlers();
    });

    return () => {
        return {server, mockCatalogClient};
    };
}