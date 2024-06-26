import { Entity } from '@backstage/catalog-model';

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
  componentName?: string;
  entityOwner?: string;
  useCodeOwnersFile: boolean;
  yaml: Entity;
};
export type PullRequestPreviewData = { [name: string]: PullRequestPreview };

export type AddRepositoriesData = {
  id: number;
  repoName?: string;
  orgName?: string;
  repoUrl?: string;
  organizationUrl?: string;
  repositories?: AddRepositoriesData[];
  selectedRepositories?: AddRepositoriesData[];
  catalogInfoYaml?: {
    status: string;
    prTemplate: PullRequestPreview;
  };
  lastUpdated?: string;
};

export type Order = 'asc' | 'desc';

export type RepositoryType = 'repository' | 'organization';

export type AddedRepositories = { [name: string]: AddRepositoriesData };

export type AddRepositoriesFormValues = {
  repositoryType: 'repository' | 'organization';
  repositories: AddedRepositories;
  approvalTool: 'git' | 'servicenow';
};

export enum RepositoryStatus {
  Exists = 'Exists',
  Ready = 'Ready',
  NotGenerated = 'Not generated',
  Failed = 'Failed',
}

export enum RepositorySelection {
  Repository = 'repository',
  Organization = 'organization',
}

export enum ApprovalTool {
  Git = 'git',
  ServiceNow = 'servicenow',
}
