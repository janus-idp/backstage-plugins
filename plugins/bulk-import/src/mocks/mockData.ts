import { AddRepositoriesData, RepositoryStatus } from '../types';
import { createData, getPRTemplate } from '../utils/repository-utils';

export const mockData = (entityOwner: string): AddRepositoriesData[] => [
  {
    id: 1,
    repoName: 'Cupcake',
    repoUrl: 'https://github.com/cupcake',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('Cupcake', entityOwner),
    },
  },
  {
    id: 2,
    repoName: 'Donut',
    repoUrl: 'https://github.com/donut',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('Donut', entityOwner),
    },
  },
  {
    id: 3,
    repoName: 'Eclair',
    repoUrl: 'https://github.com/eclair',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('Eclair', entityOwner),
    },
  },
  {
    id: 4,
    repoName: 'Frozen yoghurt',
    repoUrl: 'https://github.com/yogurt',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('Frozen yogurt', entityOwner),
    },
  },
  {
    id: 5,
    repoName: 'Gingerbread',
    repoUrl: 'https://github.com/gingerbread',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.Exists,
      prTemplate: getPRTemplate('Gingerbread', entityOwner),
    },
  },
  {
    id: 6,
    repoName: 'KitKat',
    repoUrl: 'https://github.com/kitkat',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('KitKat', entityOwner),
    },
  },
  {
    id: 7,
    repoName: 'Oreo',
    repoUrl: 'https://github.com/oreo',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('Oreo', entityOwner),
    },
  },
  {
    id: 8,
    repoName: 'food-app',
    repoUrl: 'https://github.com/food-app',
    organizationUrl: 'org/food',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('food-app', entityOwner),
    },
  },
  {
    id: 9,
    repoName: 'online-store',
    repoUrl: 'https://github.com/online-store',
    organizationUrl: 'org/pet-store-boston',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('online-store', entityOwner),
    },
  },
  {
    id: 10,
    repoName: 'pet-app',
    repoUrl: 'https://github.com/pet-app',
    organizationUrl: 'org/pet-store-boston',
    catalogInfoYaml: {
      status: RepositoryStatus.NotGenerated,
      prTemplate: getPRTemplate('pet-app', entityOwner),
    },
  },
];

export const getDataForRepositories = (entityOwner: string) => [
  createData(
    1,
    'Cupcake',
    'https://github.com/cupcake',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    2,
    'Donut',
    'https://github.com/donut',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    3,
    'Eclair',
    'https://github.com/eclair',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    4,
    'Frozen yoghurt',
    'https://github.com/yogurt',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    5,
    'Gingerbread',
    'https://github.com/gingerbread',
    RepositoryStatus.Exists,
    entityOwner,
    'org/desert',
  ),
  createData(
    6,
    'KitKat',
    'https://github.com/kitkat',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    7,
    'Oreo',
    'https://github.com/oreo',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/desert',
  ),
  createData(
    8,
    'food-app',
    'https://github.com/food-app',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/food',
  ),
  createData(
    9,
    'online-store',
    'https://github.com/online-store',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/pet-store-boston',
  ),
  createData(
    10,
    'pet-app',
    'https://github.com/pet-app',
    RepositoryStatus.NotGenerated,
    entityOwner,
    'org/pet-store-boston',
  ),
];
