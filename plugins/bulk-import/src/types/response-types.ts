export type Repository = {
  id?: string;
  url?: string;
  name?: string;
  organization?: string;
  defaultBranch?: string;
  lastUpdate?: string;
  errors?: string[];
};

export type ImportJobResponse = {
  errors: string[];
  status: string;
  catalogEntityName?: string;
  repository: Repository;
};

export type ImportJobStatus = {
  approvalTool: string;
  github: {
    pullRequest: {
      number: number;
      url: string;
    };
  };
  status: string;
  id: string;
  lastUpdate: string;
  repository: Repository;
};

export type OrgAndRepoResponse = {
  errors?: string[];
  repositories?: Repository[];
  organizations?: Repository[];
  totalCount: number;
  pagePerIntegration: number;
  sizePerIntegration: number;
};
