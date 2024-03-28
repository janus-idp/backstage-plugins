export type RepositoriesData = {
  name: string;
  repoURL: string;
  organization: string;
  status: string;
  lastUpdated: string;
};

export type AddRepositoriesData = {
  id: number;
  name: string;
  url: string;
  organization?: string;
  selectedRepositories?: number;
  catalogInfoYaml: {
    yaml: string;
    status: string;
  };
};

export type Order = 'asc' | 'desc';

export type RepositoryType = 'repository' | 'organization';

export type AddRepositoriesFormValues = {
  repositoryType: 'repository' | 'organzation';
  repositories?: AddRepositoriesData[];
  organizations?: AddRepositoriesData[];
  approvalTool: 'git' | 'servicenow';
};
