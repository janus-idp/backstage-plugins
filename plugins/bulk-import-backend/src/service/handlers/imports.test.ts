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

import {setupTest, startBackendServer} from "../../../__fixtures__/testUtils";
import {AuthorizeResult} from "@backstage/plugin-permission-common";
import {rest} from "msw";
import request from "supertest";
import {loadTestFixture, LOCAL_ADDR} from "../../../__fixtures__/handlers";
import type {CatalogRequestOptions, QueryEntitiesRequest, QueryEntitiesResponse} from "@backstage/catalog-client";

describe('imports', () => {
    const useTestData = setupTest();

    describe('GET /imports', () => {
        it.each([undefined, 'v1', 'v2'])(
            'returns 200 with empty list when there is nothing in catalog yet and no open PR for each repo (API Version: %s)',
            async apiVersion => {
                const {server, mockCatalogClient} = useTestData();
                const backendServer = await startBackendServer(mockCatalogClient, AuthorizeResult.ALLOW, {
                    catalog: { locations: [] },
                });
                server.use(
                    rest.get(
                        `http://localhost:${backendServer.port()}/api/catalog/locations`,
                        (_, res, ctx) => res(ctx.status(200), ctx.json([])),
                    ),
                );
                mockCatalogClient.queryEntities = jest
                    .fn()
                    .mockResolvedValue({ items: [] });

                let req = request(backendServer).get('/api/bulk-import/imports');
                if (apiVersion) {
                    req = req.set('api-version', apiVersion);
                }
                const response = await req;

                expect(response.status).toEqual(200);
                let expectedRespBody: any = [];
                if (apiVersion === 'v2') {
                    expectedRespBody = {
                        imports: expectedRespBody,
                        page: 1,
                        size: 20,
                        totalCount: 0,
                    };
                }
                expect(response.body).toEqual(expectedRespBody);
            },
        );

        it.each([undefined, 'v1', 'v2'])(
            'returns 200 with appropriate import status (with data coming from the repos and data coming from the app-config files) (API Version: %s)',
            async apiVersion => {
                const {server, mockCatalogClient} = useTestData();
                const backendServer = await startBackendServer(mockCatalogClient, AuthorizeResult.ALLOW);
                server.use(
                    rest.get(
                        `http://localhost:${backendServer.port()}/api/catalog/locations`,
                        (_, res, ctx) =>
                            res(
                                ctx.status(200),
                                ctx.json(loadTestFixture('catalog/locations.json')),
                            ),
                    ),
                );
                mockCatalogClient.queryEntities = jest
                    .fn()
                    .mockImplementation(
                        async (
                            _request?: QueryEntitiesRequest,
                            _options?: CatalogRequestOptions,
                        ): Promise<QueryEntitiesResponse> => {
                            return {
                                items: [
                                    {
                                        apiVersion: 'backstage.io/v1alpha1',
                                        kind: 'Location',
                                        metadata: {
                                            name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                                            namespace: 'default',
                                        },
                                    },
                                ],
                                totalItems: 1,
                                pageInfo: {},
                            };
                        },
                    );

                let req = request(backendServer).get('/api/bulk-import/imports');
                if (apiVersion) {
                    req = req.set('api-version', apiVersion);
                }
                const response = await req;

                expect(response.status).toEqual(200);
                let expectedRespBody: any = [
                    {
                        approvalTool: 'GIT',
                        id: 'https://github.com/octocat/my-awesome-repo',
                        lastUpdate: '2011-01-26T19:14:43Z',
                        repository: {
                            defaultBranch: 'dev',
                            id: 'octocat/my-awesome-repo',
                            name: 'my-awesome-repo',
                            organization: 'octocat',
                            url: 'https://github.com/octocat/my-awesome-repo',
                        },
                        status: null,
                    },
                    {
                        approvalTool: 'GIT',
                        id: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
                        lastUpdate: '2011-01-26T19:14:43Z',
                        repository: {
                            defaultBranch: 'main',
                            id: 'my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
                            name: 'my-repo-with-existing-catalog-info-in-default-branch',
                            organization: 'my-org-1',
                            url: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
                        },
                        status: 'ADDED',
                    },
                    {
                        approvalTool: 'GIT',
                        github: {
                            pullRequest: {
                                body: 'Onboarding this repository into Red Hat Developer Hub.',
                                number: 1347,
                                title: 'Add catalog-info.yaml',
                                url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/1347',
                            },
                        },
                        id: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
                        lastUpdate: '2011-01-26T19:01:12Z',
                        repository: {
                            defaultBranch: 'main',
                            id: 'my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
                            name: 'my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
                            organization: 'my-org-1',
                            url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
                        },
                        status: 'WAIT_PR_APPROVAL',
                    },
                ];
                if (apiVersion === 'v2') {
                    expectedRespBody = {
                        imports: expectedRespBody,
                        page: 1,
                        size: 20,
                        totalCount: 3,
                    };
                }
                expect(response.body).toEqual(expectedRespBody);
                // Location entity refresh triggered (on each 'ADDED' repo)
                expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(1);
            },
        );
    });

    describe('POST /imports', () => {
        it('returns 400 if there is nothing in request body', async () => {
            const {mockCatalogClient} = useTestData();
            const backendServer = await startBackendServer(mockCatalogClient, AuthorizeResult.ALLOW);

            const response = await request(backendServer)
                .post('/api/bulk-import/imports')
                .send([]);

            expect(response.status).toEqual(400);
        });

        it('returns 202 with appropriate import statuses', async () => {
            const {server, mockCatalogClient} = useTestData();
            const backendServer = await startBackendServer(mockCatalogClient, AuthorizeResult.ALLOW);

            mockCatalogClient.addLocation = jest
                .fn()
                .mockImplementation(
                    (location: { type: string; target: string; dryRun: boolean }) => {
                        let exists = false;
                        switch (location.target) {
                            case 'https://github.com/my-org-ent-1/java-quarkus-starter/blob/main/catalog-info.yaml':
                                exists = true;
                                break;
                            case 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/blob/dev/catalog-info.yaml':
                            case 'https://github.com/my-org-ent-2/animated-happiness/blob/main/catalog-info.yaml':
                            default:
                                break;
                        }
                        return Promise.resolve({ exists: exists });
                    },
                );
            mockCatalogClient.queryEntities = jest
                .fn()
                .mockImplementation(
                    async (
                        _request?: QueryEntitiesRequest,
                        _options?: CatalogRequestOptions,
                    ): Promise<QueryEntitiesResponse> => {
                        return {
                            items: [
                                {
                                    apiVersion: 'backstage.io/v1alpha1',
                                    kind: 'Location',
                                    metadata: {
                                        name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                                        namespace: 'default',
                                    },
                                },
                            ],
                            totalItems: 1,
                            pageInfo: {},
                        };
                    },
                );

            server.use(
                rest.post(
                    `http://localhost:${backendServer.port()}/api/catalog/analyze-location`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                existingEntityFiles: [],
                                generateEntities: [],
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/pulls`,
                    (_req, res, ctx) => res(ctx.status(200), ctx.json([])),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                name: 'does-not-exist-in-catalog-but-errors-with-pr-creation',
                                full_name:
                                    'my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                                url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                                html_url:
                                    'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                                default_branch: 'dev',
                                updated_at: '2017-07-08T16:18:44-04:00',
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/ref/heads%2Fdev`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                ref: 'refs/heads/dev',
                                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                                url: 'https://api.github.com/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/refs/heads/dev',
                                object: {
                                    type: 'commit',
                                    sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                                    url: 'https://api.github.com/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                                },
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/ref/heads%2Fbackstage-integration`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.post(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/refs`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(422),
                            ctx.json({
                                message: 'unable to create PR due to a server error',
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/pulls`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json(
                                loadTestFixture(
                                    'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls/open.json',
                                ),
                            ),
                        ),
                ),
                rest.patch(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/pulls/1347`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json(
                                loadTestFixture(
                                    'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls/open.json',
                                )[0],
                            ),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json(
                                loadTestFixture(
                                    'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                                ),
                            ),
                        ),
                ),
                rest.put(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(201),
                            ctx.json({
                                content: loadTestFixture(
                                    'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                                ),
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                name: 'animated-happiness',
                                full_name: 'my-org-ent-2/animated-happiness',
                                url: 'https://github.com/my-org-ent-2/animated-happiness',
                                html_url: 'https://github.com/my-org-ent-2/animated-happiness',
                                default_branch: 'main',
                                updated_at: '2017-07-08T16:18:44-04:00',
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/ref/heads%2Fmain`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                ref: 'refs/heads/main',
                                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/main',
                                object: {
                                    type: 'commit',
                                    sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                                    url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                                },
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/ref/heads%2Fbackstage-integration`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                ref: 'refs/heads/backstage-integration',
                                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/backstage-integration',
                                object: {
                                    type: 'commit',
                                    sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                                    url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                                },
                            }),
                        ),
                ),
                rest.post(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/refs`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(201),
                            ctx.json({
                                ref: 'refs/heads/backstage-integration',
                                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/featureA',
                                object: {
                                    type: 'commit',
                                    sha: 'ca218f56b14c9653891f9e74264a383fa43fefbd',
                                    url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/ca218f56b14c9653891f9e74264a383fa43fefbd',
                                },
                            }),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/java-quarkus-starter/contents/catalog-info.yaml`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json(
                                loadTestFixture(
                                    'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                                ),
                            ),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/java-quarkus-starter`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json({
                                name: 'animated-happiness',
                                full_name: 'my-org-ent-1/java-quarkus-starter',
                                url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
                                html_url:
                                    'https://github.com/my-org-ent-1/java-quarkus-starter',
                                default_branch: 'main',
                                updated_at: '2024-07-08T16:18:44-04:00',
                            }),
                        ),
                ),
            );

            const response = await request(backendServer)
                .post('/api/bulk-import/imports')
                .send([
                    {
                        repository: {
                            url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                            defaultBranch: 'dev',
                        },
                    },
                    {
                        repository: {
                            url: 'https://github.com/my-org-ent-2/animated-happiness',
                            defaultBranch: 'main',
                        },
                        catalogInfoContent: `---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: animated-happiness
  annotations:
    github.com/project-slug: my-org-ent-2/animated-happiness
spec:
  type: other
  lifecycle: unknown
  owner: my-org-ent-2
---
`,
                        github: {
                            pullRequest: {
                                title: 'Custom PR title: catalog-info.yaml',
                            },
                        },
                    },
                    {
                        repository: {
                            url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
                            defaultBranch: 'main',
                        },
                    },
                ]);

            expect(response.status).toEqual(202);
            expect(response.body).toEqual([
                {
                    errors: ['unable to create PR due to a server error'],
                    repository: {
                        defaultBranch: 'dev',
                        url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                    },
                    status: 'PR_ERROR',
                },
                {
                    github: {
                        pullRequest: {
                            number: 1347,
                            url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/1347',
                        },
                    },
                    lastUpdate: '2011-01-26T19:01:12Z',
                    repository: {
                        name: 'animated-happiness',
                        organization: 'my-org-ent-2',
                        url: 'https://github.com/my-org-ent-2/animated-happiness',
                    },
                    status: 'WAIT_PR_APPROVAL',
                },
                {
                    lastUpdate: '2024-07-08T16:18:44-04:00',
                    repository: {
                        name: 'java-quarkus-starter',
                        organization: 'my-org-ent-1',
                        url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
                    },
                    status: 'ADDED',
                },
            ]);
            // Location entity refresh triggered (on each 'ADDED' repo)
            expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(1);
        });

        it('return dry-run results in errors array for each item in request body', async () => {
            const {server, mockCatalogClient} = useTestData();
            const backendServer = await startBackendServer(mockCatalogClient, AuthorizeResult.ALLOW);

            mockCatalogClient.queryEntities = jest.fn().mockImplementation(
                async (req: {
                    filter: {
                        'metadata.name': string;
                    };
                }) => {
                    if (req.filter['metadata.name'] === 'my-entity-b') {
                        return {
                            totalItems: 1,
                            items: [
                                {
                                    apiVersion: 'backstage.io/v1alpha1',
                                    kind: 'Component',
                                    component: {
                                        name: 'my-entity-b',
                                    },
                                },
                            ],
                        };
                    }
                    return { totalItems: 0, items: [] };
                },
            );
            server.use(
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/my-repo-a/contributors`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json([loadTestFixture('github/user/user.json')]),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-1/my-repo-a/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-b/contributors`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json([loadTestFixture('github/user/user.json')]),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-b/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(200)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-c/contributors`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(204), // repo empty
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-c/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contributors`,
                    (_req, res, ctx) =>
                        res(
                            ctx.status(200),
                            ctx.json([loadTestFixture('github/user/user.json')]),
                        ),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contents/catalog-info.yaml`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
                rest.get(
                    `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contents/.github%2FCODEOWNERS`,
                    (_req, res, ctx) => res(ctx.status(404)),
                ),
            );

            const response = await request(backendServer)
                .post('/api/bulk-import/imports')
                .query({ dryRun: true })
                .send([
                    {
                        // catalogEntityName not specified => catalog entity checks will be skipped
                        repository: {
                            url: 'https://github.com/my-org-ent-1/my-repo-a',
                            defaultBranch: 'dev',
                        },
                    },
                    {
                        catalogEntityName: 'my-entity-b',
                        repository: {
                            url: 'https://github.com/my-org-ent-2/my-repo-b',
                            defaultBranch: 'main',
                        },
                    },
                    {
                        catalogEntityName: 'my-entity-c',
                        repository: {
                            url: 'https://github.com/my-org-ent-2/my-repo-c',
                            defaultBranch: 'trunk',
                        },
                    },
                    {
                        catalogEntityName: 'my-entity-d',
                        codeOwnersFileAsEntityOwner: true,
                        repository: {
                            url: 'https://github.com/my-org-ent-2/my-repo-d',
                            defaultBranch: 'devBranch',
                        },
                    },
                ]);
            expect(response.status).toEqual(202);
            expect(response.body).toEqual([
                {
                    errors: [],
                    repository: {
                        url: 'https://github.com/my-org-ent-1/my-repo-a',
                        name: 'my-repo-a',
                        organization: 'my-org-ent-1',
                    },
                },
                {
                    errors: [
                        'CATALOG_ENTITY_CONFLICT',
                        'CATALOG_INFO_FILE_EXISTS_IN_REPO',
                    ],
                    catalogEntityName: 'my-entity-b',
                    repository: {
                        url: 'https://github.com/my-org-ent-2/my-repo-b',
                        name: 'my-repo-b',
                        organization: 'my-org-ent-2',
                    },
                },
                {
                    errors: ['REPO_EMPTY'],
                    catalogEntityName: 'my-entity-c',
                    repository: {
                        url: 'https://github.com/my-org-ent-2/my-repo-c',
                        name: 'my-repo-c',
                        organization: 'my-org-ent-2',
                    },
                },
                {
                    errors: ['CODEOWNERS_FILE_NOT_FOUND_IN_REPO'],
                    catalogEntityName: 'my-entity-d',
                    repository: {
                        url: 'https://github.com/my-org-ent-2/my-repo-d',
                        name: 'my-repo-d',
                        organization: 'my-org-ent-2',
                    },
                },
            ]);
        });
    });
});