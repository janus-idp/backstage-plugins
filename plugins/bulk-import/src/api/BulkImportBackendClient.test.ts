import { IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  mockGetImportJobs,
  mockGetOrganizations,
  mockGetRepositories,
  mockSelectedRepositories,
} from '../mocks/mockData';
import { ApprovalTool, RepositoryStatus } from '../types';
import { prepareDataForSubmission } from '../utils/repository-utils';
import {
  BulkImportAPI,
  BulkImportBackendClient,
} from './BulkImportBackendClient';

const LOCAL_ADDR = 'https://localhost:7007';
const handlers = [
  rest.get(`${LOCAL_ADDR}/api/bulk-import/repositories`, (req, res, ctx) => {
    const searchParam = req.url.searchParams.get('search');
    const test = req.headers.get('Content-Type');
    if (searchParam) {
      return res(
        ctx.status(200),
        ctx.json(
          mockGetRepositories.repositories.filter(r =>
            r.repoName?.includes(searchParam),
          ),
        ),
      );
    }
    if (test === 'application/json') {
      return res(ctx.status(200), ctx.json(mockGetRepositories.repositories));
    }
    return res(ctx.status(404));
  }),
  rest.get(
    `${LOCAL_ADDR}/api/bulk-import/organizations/org/dessert/repositories`,
    (req, res, ctx) => {
      const test = req.headers.get('Content-Type');
      const searchParam = req.url.searchParams.get('search');
      if (searchParam) {
        return res(
          ctx.status(200),
          ctx.json(
            mockGetRepositories.repositories.filter(
              r =>
                r.orgName === 'org/dessert' &&
                r.repoName?.includes(searchParam),
            ),
          ),
        );
      }
      if (test === 'application/json') {
        return res(
          ctx.status(200),
          ctx.json(
            mockGetRepositories.repositories.filter(
              r => r.orgName === 'org/dessert',
            ),
          ),
        );
      }
      return res(ctx.status(404));
    },
  ),
  rest.get(`${LOCAL_ADDR}/api/bulk-import/organizations`, (req, res, ctx) => {
    const test = req.headers.get('Content-Type');
    const searchParam = req.url.searchParams.get('search');

    if (searchParam) {
      return res(
        ctx.status(200),
        ctx.json(
          mockGetOrganizations.organizations.filter(r =>
            r.orgName?.includes(searchParam),
          ),
        ),
      );
    }
    if (test === 'application/json') {
      return res(ctx.status(200), ctx.json(mockGetOrganizations.organizations));
    }
    return res(ctx.status(404));
  }),
  rest.get(
    `${LOCAL_ADDR}/api/bulk-import/import/by-repo?repo=org/dessert/donut&defaultBranch=master`,
    (req, res, ctx) => {
      const test = req.headers.get('Content-Type');
      if (test === 'application/json') {
        return res(ctx.status(200), ctx.json(mockGetImportJobs[1]));
      }
      return res(ctx.status(404));
    },
  ),
  rest.get(`${LOCAL_ADDR}/api/bulk-import/imports`, (req, res, ctx) => {
    const test = req.headers.get('Content-Type');
    const searchParam = req.url.searchParams.get('search');

    if (searchParam) {
      return res(
        ctx.status(200),
        ctx.json(
          mockGetImportJobs.filter(r =>
            r.repository.name?.includes(searchParam),
          ),
        ),
      );
    }
    if (test === 'application/json') {
      return res(ctx.status(200), ctx.json(mockGetImportJobs));
    }
    return res(ctx.status(404));
  }),
  rest.post(
    `${LOCAL_ADDR}/api/bulk-import/imports?dryRun=true`,
    async (req, res, ctx) => {
      const jobs = await req.json();
      if (
        !jobs ||
        jobs.length === 0 ||
        jobs.some(
          (job: { repository: { name: string } }) => job.repository.name === '',
        )
      ) {
        return res(
          ctx.json({
            message: 'Dry run for creating import jobs failed',
            ok: false,
            status: 404,
          }),
        );
      }
      return res(ctx.json(jobs));
    },
  ),
  rest.delete(
    `${LOCAL_ADDR}/api/bulk-import/import/by-repo?repo=org/dessert/donut&defaultBranch=master`,
    (req, res, ctx) => {
      const test = req.headers.get('Content-Type');
      if (test === 'application/json') {
        return res(ctx.status(200));
      }
      return res(ctx.status(404));
    },
  ),
];
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('BulkImportBackendClient', () => {
  let bulkImportApi: BulkImportAPI;
  const getConfigApi = (getOptionalStringFn: any) => ({
    has: jest.fn(),
    keys: jest.fn(),
    get: jest.fn(),
    getBoolean: jest.fn(),
    getConfig: jest.fn(),
    getConfigArray: jest.fn(),
    getNumber: jest.fn(),
    getString: jest.fn(key => {
      if (key === 'backend.baseUrl') {
        return LOCAL_ADDR;
      }
      return '';
    }),
    getStringArray: jest.fn(),
    getOptional: jest.fn(),
    getOptionalStringArray: jest.fn(),
    getOptionalBoolean: jest.fn(),
    getOptionalConfig: jest.fn(),
    getOptionalConfigArray: jest.fn(),
    getOptionalNumber: jest.fn(),
    getOptionalString: getOptionalStringFn,
  });

  const bearerToken = 'test-token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  beforeEach(() => {
    bulkImportApi = new BulkImportBackendClient({
      configApi: getConfigApi(() => {
        return '/api';
      }),
      identityApi: identityApi,
    });
  });

  describe('getRepositories', () => {
    it('getRepositories should retrieve repositories successfully', async () => {
      const repositories = await bulkImportApi.dataFetcher(1, 2, '');
      expect(repositories).toEqual(mockGetRepositories.repositories);
    });

    it('getRepositories should retrieve repositories based on search string', async () => {
      const repositories = await bulkImportApi.dataFetcher(1, 2, 'ap');
      expect(repositories).toEqual(
        mockGetRepositories.repositories.filter(r => r.repoName.includes('ap')),
      );
    });

    it('getRepositories should handle non-200/204 responses correctly', async () => {
      server.use(
        rest.get(
          `${LOCAL_ADDR}/api/bulk-import/repositories`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      await expect(bulkImportApi.dataFetcher(1, 2, '')).resolves.toEqual(
        expect.objectContaining([]),
      );
    });
  });

  describe('getRepositories from an organization', () => {
    it('getRepositories should retrieve repositories from an organization successfully', async () => {
      const repositories = await bulkImportApi.dataFetcher(1, 2, '', {
        orgName: 'org/dessert',
      });
      expect(repositories).toEqual(
        mockGetRepositories.repositories.slice(0, 7),
      );
    });

    it('getRepositories should retrieve repositories from an organization based on search string', async () => {
      const repositories = await bulkImportApi.dataFetcher(1, 2, 'des', {
        orgName: 'org/dessert',
      });
      expect(repositories).toEqual(
        mockGetRepositories.repositories
          .slice(0, 7)
          .filter(r => r.repoName.includes('des')),
      );
    });
  });

  describe('getOrganizations', () => {
    it('getOrganizations should retrieve organizations successfully', async () => {
      const orgs = await bulkImportApi.dataFetcher(1, 2, '', {
        fetchOrganizations: true,
      });
      expect(orgs).toEqual(mockGetOrganizations.organizations);
    });

    it('getOrganizations should retrieve organizations based on search string', async () => {
      const orgs = await bulkImportApi.dataFetcher(1, 2, 'des', {
        fetchOrganizations: true,
      });
      expect(orgs).toEqual(
        mockGetOrganizations.organizations.filter(r =>
          r.orgName.includes('des'),
        ),
      );
    });

    it('getOrganizations should handle non-200/204 responses correctly', async () => {
      server.use(
        rest.get(
          `${LOCAL_ADDR}/api/bulk-import/organizations`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      await expect(
        bulkImportApi.dataFetcher(1, 2, '', { fetchOrganizations: true }),
      ).resolves.toEqual(expect.objectContaining([]));
    });
  });

  describe('getImportJobs', () => {
    it('getImportJobs should retrieve the import jobs successfully', async () => {
      const jobs = await bulkImportApi.getImportJobs(1, 2, '');
      expect(jobs).toEqual(mockGetImportJobs);
    });

    it('getImportJobs should retrieve the import jobs based on search string', async () => {
      const jobs = await bulkImportApi.getImportJobs(1, 2, 'cup');
      expect(jobs).toEqual(
        mockGetImportJobs.filter(r => r.repository.name?.includes('cup')),
      );
    });

    it('getImportJobs should handle non-200/204 responses correctly', async () => {
      await expect(bulkImportApi.getImportJobs(1, 2, '')).resolves.toEqual(
        expect.objectContaining([]),
      );
    });
  });

  describe('deleteImportAction', () => {
    it('deleteImportAction should send a DELETE request and handle successful response', async () => {
      const response = await bulkImportApi.deleteImportAction(
        'org/dessert/cupcake',
        'main',
      );

      expect(response.status).toBe(200);
    });

    it('getImportAction should retrive the status of the repo', async () => {
      const response = await bulkImportApi.getImportAction(
        'org/dessert/donut',
        'master',
      );

      expect(response.status).toBe(RepositoryStatus.WAIT_PR_APPROVAL);
      expect(response).toEqual(mockGetImportJobs[1]);
    });
  });

  describe('createImportJobs', () => {
    it('createImportJobs should be able to dry run and check for errors', async () => {
      let response = await bulkImportApi.createImportJobs(
        prepareDataForSubmission(mockSelectedRepositories, ApprovalTool.Git),
        true,
      );
      expect(response.length).toBe(4);

      response = await bulkImportApi.createImportJobs(
        prepareDataForSubmission(
          {
            ['org/dessert/cupcake']: {
              ...mockGetRepositories.repositories[0],
              repoName: '',
            },
          },
          ApprovalTool.Git,
        ),
        true,
      );
      expect(response).toEqual({
        message: 'Dry run for creating import jobs failed',
        ok: false,
        status: 404,
      });
    });
  });
});
