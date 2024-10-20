import { AddedRepositories, ApprovalTool, ImportJobs } from '../types';

export const mockGetOrganizations = {
  errors: [],
  organizations: [
    {
      id: '1234',
      name: 'org/dessert',
      url: 'https://github.com/org/dessert',
      orgName: 'org/dessert',
      organizationUrl: 'https://github.com/org/dessert',
      totalRepoCount: 7,
      errors: [],
    },
    {
      id: '1235',
      name: 'org/food',
      url: 'https://github.com/org/food',
      orgName: 'org/food',
      totalRepoCount: 1,
      organizationUrl: 'https://github.com/org/food',
      errors: [],
    },
    {
      id: '1236',
      name: 'org/pet-store-boston',
      url: 'https://github.com/org/pet-store-boston',
      orgName: 'org/pet-store-boston',
      totalRepoCount: 2,
      organizationUrl: 'https://github.com/org/pet-store-boston',
      errors: [],
    },
  ],
  totalCount: 3,
  pagePerIntegration: 1,
  sizePerIntegration: 5,
};
const dessertOrg = {
  defaultBranch: 'master',
  organization: 'org/dessert',
  orgName: 'org/dessert',
  organizationUrl: 'https://github.com/org/dessert',
};

export const mockGetRepositories = {
  errors: [],
  repositories: [
    {
      id: 'org/dessert/cupcake',
      name: 'cupcake',
      repoName: 'cupcake',
      url: 'https://github.com/org/dessert/cupcake',
      repoUrl: 'https://github.com/org/dessert/cupcake',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/donut',
      name: 'donut',
      repoName: 'donut',
      url: 'https://github.com/org/dessert/donut',
      repoUrl: 'https://github.com/org/dessert/donut',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/eclair',
      name: 'eclair',
      repoName: 'eclair',
      url: 'https://github.com/org/dessert/eclair',
      repoUrl: 'https://github.com/org/dessert/eclair',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/frozenyogurt',
      name: 'frozenyogurt',
      repoName: 'frozenyogurt',
      url: 'https://github.com/org/dessert/frozenyogurt',
      repoUrl: 'https://github.com/org/dessert/frozenyogurt',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/gingerbread',
      name: 'gingerbread',
      url: 'https://github.com/org/dessert/gingerbread',
      repoName: 'gingerbread',
      repoUrl: 'https://github.com/org/dessert/gingerbread',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/kitkat',
      name: 'kitkat',
      url: 'https://github.com/org/dessert/kitkat',
      repoName: 'kitkat',
      repoUrl: 'https://github.com/org/dessert/kitkat',
      ...dessertOrg,
    },
    {
      id: 'org/dessert/oreo',
      name: 'oreo',
      url: 'https://github.com/org/dessert/oreo',
      repoName: 'oreo',
      repoUrl: 'https://github.com/org/dessert/oreo',
      ...dessertOrg,
    },
    {
      id: 'org/food/food-app',
      name: 'food-app',
      url: 'https://github.com/org/food/food-app',
      repoName: 'food-app',
      repoUrl: 'https://github.com/org/food/food-app',
      defaultBranch: 'master',
      organization: 'org/food',
      orgName: 'org/food',
      organizationUrl: 'https://github.com/org/food',
    },
    {
      id: 'org/pet-store-boston/online-store',
      name: 'online-store',
      repoName: 'online-store',
      defaultBranch: 'master',
      url: 'https://github.com/org/pet-store-boston/online-store',
      repoUrl: 'https://github.com/org/pet-store-boston/online-store',
      organization: 'org/pet-store-boston',
      orgName: 'org/pet-store-boston',
      organizationUrl: 'https://github.com/org/pet-store-boston',
    },
    {
      id: 'org/pet-store-boston/pet-app',
      name: 'pet-app',
      repoName: 'pet-app',
      defaultBranch: 'master',
      url: 'https://github.com/org/pet-store-boston/pet-app',
      repoUrl: 'https://github.com/org/pet-store-boston/pet-app',
      organization: 'org/pet-store-boston',
      orgName: 'org/pet-store-boston',
      organizationUrl: 'https://github.com/org/pet-store-boston',
    },
  ],
  totalCount: 10,
  pagePerIntegration: 1,
  sizePerIntegration: 5,
};

export const mockGetImportJobs: ImportJobs = {
  imports: [
    {
      approvalTool: ApprovalTool.Git,
      github: {
        pullRequest: {
          number: 90,
          url: 'https://github.com/org/dessert/cupcake/pull/90',
          body: 'PR body',
          catalogInfoContent:
            'apiVersion: backstage.io/v1alpha1\nkind: Component\nmetadata:\n  name: che1\n  annotations:\n    github.com/project-slug: debsmita1/che\nspec:\n  type: other\n  lifecycle: unknown\n  owner: user:default/debsmita1\n',
          title: 'PR title',
        },
      },
      lastUpdate: '2024-07-17T13:46:37Z',
      repository: {
        id: 'org/dessert/cupcake',
        name: 'cupcake',
        url: 'https://github.com/org/dessert/cupcake',
        defaultBranch: 'master',
        organization: 'org/dessert',
      },
      id: 'org/dessert/cupcake',
      status: 'WAIT_PR_APPROVAL',
    },
    {
      approvalTool: ApprovalTool.Git,
      github: {
        pullRequest: {
          body: 'PR body',
          catalogInfoContent:
            '\nkind: Component\nmetadata:\n  name: che1\n  annotations:\n    github.com/project-slug: debsmita1/che\nspec:\n  type: other\n  lifecycle: unknown\n  owner: user:default/debsmita1\n',
          title: 'PR title',
          number: 91,
          url: 'https://github.com/org/dessert/donut/pull/91',
        },
      },
      lastUpdate: '2024-07-18T13:46:37Z',
      repository: {
        id: 'org/dessert/donut',
        name: 'donut',
        url: 'https://github.com/org/dessert/donut',
        defaultBranch: 'master',
        organization: 'org/dessert',
      },
      id: 'org/dessert/donut',
      status: 'WAIT_PR_APPROVAL',
    },
    {
      approvalTool: ApprovalTool.Git,
      github: {
        pullRequest: {
          number: 94,
          url: 'https://github.com/org/food/food-app/pull/94',
          body: 'PR body',
          catalogInfoContent:
            'apiVersion: backstage.io/v1alpha1\nkind: Component\nmetadata:\n  name: che1\n  annotations:\n    github.com/project-slug: debsmita1/che\nspec:\n  type: other\n  lifecycle: unknown\n  owner: user:default/debsmita1\n',
          title: 'PR title',
        },
      },
      lastUpdate: '2024-07-21T13:46:37Z',
      repository: {
        id: 'org/food/food-app',
        name: 'food-app',
        url: 'https://github.com/org/food/food-app',
        defaultBranch: 'master',
        organization: 'org/food',
      },
      id: 'org/food/food-app',
      status: 'WAIT_PR_APPROVAL',
    },
    {
      approvalTool: ApprovalTool.Git,
      github: {
        pullRequest: {
          number: 95,
          url: 'https://github.com/org/pet-store-boston/pet-app/pull/95',
          body: 'PR body',
          catalogInfoContent:
            'apiVersion: backstage.io/v1alpha1\nkind: Component\nmetadata:\n  name: che1\n  annotations:\n    github.com/project-slug: debsmita1/che\nspec:\n  type: other\n  lifecycle: unknown\n  owner: user:default/debsmita1\n',
          title: 'PR title',
        },
      },
      lastUpdate: '2024-07-22T13:46:37Z',
      repository: {
        id: 'org/pet-store-boston/pet-app',
        name: 'pet-app',
        url: 'https://github.com/org/pet-store-boston/pet-app',
        defaultBranch: 'master',
        organization: 'org/pet-store-boston',
      },
      id: 'org/pet-store-boston/pet-app',
      status: 'ADDED',
    },
  ],
  page: 1,
  size: 5,
  totalCount: 4,
};

export const mockSelectedRepositories: AddedRepositories = {
  ['org/dessert/cupcake']: mockGetRepositories.repositories[0],
  ['org/dessert/donut']: mockGetRepositories.repositories[1],
  ['org/dessert/eclair']: mockGetRepositories.repositories[2],
  ['org/dessert/frozenyogurt']: mockGetRepositories.repositories[3],
};
