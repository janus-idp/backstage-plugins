import React from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import {
  MockConfigApi,
  MockPermissionApi,
  TestApiProvider,
} from '@backstage/test-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import {
  BulkImportAPI,
  bulkImportApiRef,
} from '../src/api/BulkImportBackendClient';
import { BulkImportIcon } from '../src/components/BulkImportSidebarItem';
import {
  mockGetImportJobs,
  mockGetOrganizations,
  mockGetRepositories,
} from '../src/mocks/mockData';
import { mockEntities } from '../src/mocks/mockEntities';
import { BulkImportPage, bulkImportPlugin } from '../src/plugin';
import {
  APITypes,
  ImportJobResponse,
  ImportJobs,
  ImportJobStatus,
  OrgAndRepoResponse,
  RepositoryStatus,
} from '../src/types';

const mockCatalogApi = {
  getEntities: async () => ({ items: mockEntities }),
};

class MockBulkImportApi implements BulkImportAPI {
  async dataFetcher(
    page: number,
    size: number,
    searchString: string,
    options?: APITypes,
  ): Promise<OrgAndRepoResponse> {
    if (options?.orgName) {
      return {
        ...mockGetRepositories,
        repositories: mockGetRepositories.repositories
          ?.filter(
            r =>
              r.id?.includes(options?.orgName as string) &&
              r.repoName?.includes(searchString),
          )
          ?.slice((page - 1) * size, (page - 1) * size + size),
        totalCount: mockGetRepositories.repositories?.filter(r =>
          r.id?.includes(options.orgName as string),
        ).length,
      };
    }
    if (options?.fetchOrganizations) {
      return {
        ...mockGetOrganizations,
        organizations: mockGetOrganizations.organizations
          ?.filter(r => r.orgName?.includes(searchString))
          ?.slice((page - 1) * size, (page - 1) * size + size),
      };
    }
    return {
      ...mockGetRepositories,
      repositories: mockGetRepositories.repositories
        ?.filter(r => r.repoName?.includes(searchString))
        ?.slice((page - 1) * size, (page - 1) * size + size),
    };
  }

  async getImportJobs(
    _page: number,
    _size: number,
    _seachString: string,
  ): Promise<ImportJobs> {
    return mockGetImportJobs;
  }

  async createImportJobs(
    _importRepositories: any[],
    _dryRun?: boolean,
  ): Promise<ImportJobResponse[]> {
    return [
      {
        errors: [],
        status: RepositoryStatus.WAIT_PR_APPROVAL,
        catalogEntityName: '',
        repository: {
          id: 'REPO',
          url: 'das',
          organization: 'dasa',
          defaultBranch: 'main',
          name: 'jhk',
        },
      },
    ] as ImportJobResponse[];
  }

  async deleteImportAction(
    _repo: string,
    _defaultBranch: string,
  ): Promise<ImportJobStatus | Response> {
    return {} as Response;
  }
  async getImportAction(
    repo: string,
    _defaultBranch: string,
  ): Promise<ImportJobStatus | Response> {
    return mockGetImportJobs.imports.find(
      i => i.repository.url === repo,
    ) as ImportJobStatus;
  }
}

const mockBulkImportApi = new MockBulkImportApi();
const mockPermissionApi = new MockPermissionApi();

const mockConfigApi = new MockConfigApi({
  permission: {
    enabled: true,
  },
  app: {
    baseUrl: 'https://base-url',
  },
});

createDevApp()
  .registerPlugin(bulkImportPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [permissionApiRef, mockPermissionApi],
          [catalogApiRef, mockCatalogApi],
          [bulkImportApiRef, mockBulkImportApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <BulkImportPage />
      </TestApiProvider>
    ),
    title: 'Bulk import',
    path: '/bulk-import/repositories',
    icon: BulkImportIcon,
  })
  .render();
