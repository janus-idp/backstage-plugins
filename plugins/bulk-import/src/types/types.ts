import { Entity } from '@backstage/catalog-model';

import { Repository as RepositoryResponse } from './response-types';

export type RepositoriesData = {
  id: number;
  name: string;
  repoURL: string;
  organization: string;
  status: string;
  lastUpdated: string;
};

export type PullRequestPreview = {
  prTitle?: string;
  prDescription?: string;
  prAnnotations?: string;
  prLabels?: string;
  prSpec?: string;
  pullRequestUrl?: string;
  componentName?: string;
  entityOwner?: string;
  useCodeOwnersFile: boolean;
  yaml: Entity;
};
export type PullRequestPreviewData = { [name: string]: PullRequestPreview };

export type ImportStatus =
  | 'ADDED'
  | 'WAIT_PR_APPROVAL'
  | 'PR_ERROR'
  | 'Ready'
  | 'NotGenerated'
  | 'CATALOG_INFO_FILE_EXISTS_IN_REPO'
  | 'CATALOG_ENTITY_CONFLICT'
  | 'REPO_EMPTY'
  | 'CODEOWNERS_FILE_NOT_FOUND_IN_REPO';

export type AddRepositoryData = {
  id: string;
  defaultBranch?: string;
  repoName?: string;
  orgName?: string;
  totalReposInOrg?: number;
  repoUrl?: string;
  organizationUrl?: string;
  selectedRepositories?: AddedRepositories;
  catalogInfoYaml?: {
    status?: ImportStatus;
    prTemplate?: PullRequestPreview;
    lastUpdated?: string;
  };
  lastUpdated?: string;
};

export type Order = 'asc' | 'desc';

export type RepositoryType = 'repository' | 'organization';

export type AddedRepositories = { [id: string]: AddRepositoryData };

export type AddRepositoriesFormValues = {
  repositoryType: RepositorySelection;
  repositories: AddedRepositories;
  excludedRepositories: {
    [repoId: string]: { repoId: string; orgName: string; status: string };
  };
  approvalTool: ApprovalTool;
};

export enum RepositoryStatus {
  ADDED = 'ADDED',
  'WAIT_PR_APPROVAL' = 'WAIT_PR_APPROVAL',
  Ready = 'Ready',
  NotGenerated = 'NotGenerated',
  'PR_ERROR' = 'PR_ERROR',
  'CATALOG_INFO_FILE_EXISTS_IN_REPO' = 'CATALOG_INFO_FILE_EXISTS_IN_REPO',
  'CATALOG_ENTITY_CONFLICT' = 'CATALOG_ENTITY_CONFLICT',
  'REPO_EMPTY' = 'REPO_EMPTY',
  'CODEOWNERS_FILE_NOT_FOUND_IN_REPO' = 'CODEOWNERS_FILE_NOT_FOUND_IN_REPO',
}

export enum RepositorySelection {
  Repository = 'repository',
  Organization = 'organization',
}

export enum ApprovalTool {
  Git = 'git',
  ServiceNow = 'servicenow',
}

export type CreateImportJobRepository = {
  approvalTool: string;
  catalogEntityName: string;
  codeOwnersFileAsEntityOwner: boolean;
  catalogInfoContent: string;
  github: {
    pullRequest: {
      title: string;
      body: string;
    };
  };
  repository: RepositoryResponse;
};

export type APITypes = {
  orgName?: string;
  fetchOrganizations?: boolean;
};

export type ErrorType = {
  [repoName: string]: {
    repository: {
      name: string;
      organization: string;
    };
    catalogEntityName: string;
    error: {
      message: RepositoryStatus[];
    };
  };
};

export type JobErrors = {
  errors: ErrorType | null;
  infos: ErrorType | null;
};

export interface RepositoriesError extends Error {
  errors?: string[];
}

export type DataFetcherQueryParams = {
  page: number;
  querySize: number;
  showOrganizations?: boolean;
  orgName?: string;
  searchString?: string;
};
