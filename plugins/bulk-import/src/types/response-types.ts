import { RepositoryStatus } from './types';

export type Repository = {
  id: string;
  url?: string;
  name?: string;
  organization?: string;
  defaultBranch?: string;
  lastUpdate?: string;
  errors?: string[];
  totalRepoCount?: number;
};

export type ImportJobResponse = {
  errors: RepositoryStatus[];
  status: RepositoryStatus;
  catalogEntityName?: string;
  repository: Repository;
};

export type ImportJobStatus = {
  approvalTool: string;
  github: {
    pullRequest: {
      number: number;
      url: string;
      title: string;
      body: string;
      catalogInfoContent: string;
    };
  };
  status: string;
  id: string;
  lastUpdate: string;
  repository: Repository;
};

export type ImportJobs = {
  imports: ImportJobStatus[];
  page: number;
  size: number;
  totalCount: number;
};

export type OrgAndRepoResponse = {
  errors?: string[];
  repositories?: Repository[];
  organizations?: Repository[];
  totalCount: number;
  pagePerIntegration: number;
  sizePerIntegration: number;
};
