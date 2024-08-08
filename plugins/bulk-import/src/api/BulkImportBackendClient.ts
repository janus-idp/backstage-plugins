import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  ImportJobResponse,
  ImportJobStatus,
  OrgAndRepoResponse,
} from '../types/response-types';
import { CreateImportJobRepository } from '../types/types';

// @public
export type BulkImportAPI = {
  getUserAuthorization: () => Promise<{ status: string }>;
  getRepositories: (page: number, size: number) => Promise<OrgAndRepoResponse>;
  getRepositoriesFromOrg: (
    orgName: string,
    page: number,
    size: number,
  ) => Promise<OrgAndRepoResponse>;
  getOrganizations: (page: number, size: number) => Promise<OrgAndRepoResponse>;
  getImportJobs: (page: number, size: number) => Promise<ImportJobStatus[]>;
  createImportJobs: (
    importRepositories: CreateImportJobRepository[],
    dryRun?: boolean,
  ) => Promise<ImportJobResponse[]>;
  checkImportStatus: (
    repo: string,
    defaultBranch: string,
  ) => Promise<ImportJobStatus>;
  removeRepository: (repo: string, defaultBranch: string) => Promise<Response>;
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

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/ping`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    return jsonResponse.json();
  }

  async getRepositories(page: number, size: number) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/repositories?pagePerIntegration=${page}&sizePerIntegration=${size}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async getOrganizations(page: number, size: number) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/organizations?pagePerIntegration=${page}&sizePerIntegration=${size}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async getRepositoriesFromOrg(orgName: string, page: number, size: number) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/organizations/${orgName}/repositories?pagePerIntegration=${page}&sizePerIntegration=${size}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
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
        ? `${backendUrl}/api/bulk-import-backend/imports?dryRun=true`
        : `${backendUrl}/api/bulk-import-backend/imports`,
      {
        method: 'POST',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importRepositories),
      },
    );
    return jsonResponse.json();
  }

  async getImportJobs(page: number, size: number) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/imports?pagePerIntegration=${page}&sizePerIntegration=${size}`,
      {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async checkImportStatus(repo: string, defaultBranch: string) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );

    return jsonResponse.json();
  }

  async removeRepository(repo: string, defaultBranch: string) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'DELETE',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }
}
