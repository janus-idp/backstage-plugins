import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  APITypes,
  CreateImportJobRepository,
  ImportJobResponse,
  ImportJobStatus,
  OrgAndRepoResponse,
} from '../types';
import { getApi } from '../utils/repository-utils';

// @public
export type BulkImportAPI = {
  dataFetcher: (
    page: number,
    size: number,
    searchString: string,
    options?: APITypes,
  ) => Promise<OrgAndRepoResponse>;
  getImportJobs: (
    page: number,
    size: number,
    searchString: string,
  ) => Promise<ImportJobStatus[] | Response>;
  createImportJobs: (
    importRepositories: CreateImportJobRepository[],
    dryRun?: boolean,
  ) => Promise<ImportJobResponse[]>;
  deleteImportAction: (
    repo: string,
    defaultBranch: string,
  ) => Promise<ImportJobStatus | Response>;
  getImportAction: (
    repo: string,
    defaultBranch: string,
  ) => Promise<ImportJobStatus | Response>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

// @public
export const bulkImportApiRef = createApiRef<BulkImportAPI>({
  id: 'plugin.bulk-import.service',
});

export class BulkImportBackendClient implements BulkImportAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async dataFetcher(
    page: number,
    size: number,
    searchString: string,
    options?: APITypes,
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      getApi(backendUrl, page, size, searchString, options),
      {
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async getImportJobs(page: number, size: number, searchString: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import/imports?pagePerIntegration=${page}&sizePerIntegration=${size}&search=${searchString}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async createImportJobs(
    importRepositories: CreateImportJobRepository[],
    dryRun?: boolean,
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      dryRun
        ? `${backendUrl}/api/bulk-import/imports?dryRun=true`
        : `${backendUrl}/api/bulk-import/imports`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(importRepositories),
      },
    );
    if (!jsonResponse.ok) {
      const errorResponse = await jsonResponse.json();
      throw errorResponse;
    }
    return jsonResponse.status === 204 ? null : await jsonResponse.json();
  }

  async deleteImportAction(repo: string, defaultBranch: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async getImportAction(repo: string, defaultBranch: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }
}
