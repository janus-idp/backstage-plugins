import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import {
  BulkImportAPI,
  bulkImportApiRef,
} from '../src/api/BulkImportBackendClient';
import { icon } from '../src/components/BulkImportIcon';
import {
  mockGetImportJobs,
  mockGetOrganizations,
  mockGetRepositories,
} from '../src/mocks/mockData';
import { mockEntities } from '../src/mocks/mockEntities';
import { BulkImportPage, bulkImportPlugin } from '../src/plugin';
import {
  ImportJobResponse,
  ImportJobStatus,
  OrgAndRepoResponse,
} from '../src/types/response-types';

const mockCatalogApi = {
  getEntities: async () => ({ items: mockEntities }),
};

class MockBulkImportApi implements BulkImportAPI {
  readonly repos;
  readonly orgs;

  constructor(repoData: any[], orgData: any[]) {
    this.repos = repoData;
    this.orgs = orgData;
  }

  async getRepositories(_page: number): Promise<OrgAndRepoResponse> {
    return mockGetRepositories;
  }

  async getOrganizations(_page: number): Promise<OrgAndRepoResponse> {
    return mockGetOrganizations;
  }

  async getRepositoriesFromOrg(
    orgName: string,
    _page: number,
  ): Promise<OrgAndRepoResponse> {
    return {
      ...mockGetRepositories,
      repositories: mockGetRepositories.repositories?.filter(r =>
        r.id?.includes(orgName),
      ),
    };
  }

  async getUserAuthorization(): Promise<{ status: string }> {
    return {
      status: 'Authorized',
    };
  }

  async getImportJobs(_page: number): Promise<any> {
    return mockGetImportJobs;
  }

  async removeRepository(_repo: string, _defaultBranch: string): Promise<any> {
    return;
  }

  async createImportJobs(
    _importRepositories: any[],
    _dryRun?: boolean,
  ): Promise<ImportJobResponse[]> {
    return [
      {
        errors: [],
        status: 'da',
        catalogEntityName: '',
        repository: {
          url: 'das',
          organization: 'dasa',
          defaultBranch: 'main',
          name: 'jhk',
        },
      },
    ] as ImportJobResponse[];
  }

  async checkImportStatus(
    repo: string,
    _defaultBranch: string,
  ): Promise<ImportJobStatus> {
    return mockGetImportJobs.find(
      i => i.repository.name === repo,
    ) as ImportJobStatus;
  }
}

const mockBulkImportApi = new MockBulkImportApi(
  mockGetRepositories.repositories,
  mockGetOrganizations.organizations,
);

createDevApp()
  .registerPlugin(bulkImportPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [catalogApiRef, mockCatalogApi],
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <BulkImportPage />
      </TestApiProvider>
    ),
    title: 'Bulk import',
    path: '/bulk-import/repositories',
    icon,
  })
  .render();
