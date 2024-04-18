import {
  createData,
  createOrganizationData,
} from '../../utils/repository-utils';

export const getDataForRepositories = () => [
  createData(1, 'Cupcake', 'https://github.com/cupcake', '', 'org/desert', 0),
  createData(2, 'Donut', 'https://github.com/donut', 'Done', 'org/desert', 0),
  createData(3, 'Eclair', 'https://github.com/eclair', '', 'org/desert', 0),
  createData(
    4,
    'Frozen yoghurt',
    'https://github.com/yogurt',
    '',
    'org/desert',
    0,
  ),
  createData(
    5,
    'Gingerbread',
    'https://github.com/gingerbread',
    'Exists',
    'org/desert',
    0,
  ),
  createData(9, 'KitKat', 'https://github.com/kitkat', '', 'org/desert', 0),
  createData(13, 'Oreo', 'https://github.com/oreo', '', 'org/desert', 0),
  createData(
    10,
    'food-app',
    'https://github.com/food-app',
    'Progress',
    'org/pet-store-boston',
    0,
  ),
  createData(
    11,
    'online-store',
    'https://github.com/online-store',
    'Done',
    'org/pet-store-boston',
    0,
  ),
  createData(
    12,
    'pet-app',
    'https://github.com/pet-app',
    'Failed',
    'org/pet-store-boston',
    0,
  ),
  createData(
    15,
    'test-2',
    'https://github.com/test',
    '',
    'org/fruit-store-nyc',
    0,
  ),
  createData(
    16,
    'test-3',
    'https://github.com/test',
    '',
    'org/fruit-store-nyc',
    0,
  ),
  createData(
    18,
    'test-6',
    'https://github.com/test',
    'Exists',
    'org/desert-1',
    0,
  ),
  createData(20, 'test-8', 'https://github.com/test', '', 'org/desert-1', 0),
  createData(
    21,
    'test-9',
    'https://github.com/test',
    'Exists',
    'org/desert-1',
    0,
  ),
  createData(22, 'test-10', 'https://github.com/test', '', 'org/desert-1', 0),
  createData(23, 'test-11', 'https://github.com/test', '', 'org/desert-1', 0),
  createData(
    24,
    'food-app-1',
    'https://github.com/pet-store-raleigh',
    '',
    'org/pet-store-raleigh',
    0,
  ),
  createData(
    27,
    'Cupcake-2',
    'https://github.com/desert-2',
    '',
    'org/desert-2',
    0,
  ),
  createData(
    28,
    'Donut-2',
    'https://github.com/desert-2',
    '',
    'org/desert-2',
    0,
  ),
];

export const getDataForOrganizations = () => [
  createOrganizationData(
    101,
    'org/pet-store-boston',
    'https://github.com/pet-store-boston',
    [
      {
        id: 10,
        name: 'food-app',
        url: 'https://github.com/food-app',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Progress',
          yaml: '',
        },
      },
      {
        id: 11,
        name: 'online-store',
        url: 'https://github.com/online-store',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Done',
          yaml: '',
        },
      },
      {
        id: 12,
        name: 'pet-app',
        url: 'https://github.com/pet-app',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Failed',
          yaml: '',
        },
      },
    ],
  ),
  createOrganizationData(102, 'org/desert', 'https://github.com/desert', [
    {
      id: 1,
      name: 'Cupcake',
      url: 'https://github.com/cupcake',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Progress',
        yaml: '',
      },
    },
    {
      id: 2,
      name: 'Donut',
      url: 'https://github.com/donut',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
    {
      id: 3,
      name: 'Eclair',
      url: 'https://github.com/eclair',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Failed',
        yaml: '',
      },
    },
    {
      id: 4,
      name: 'Frozen yoghurt',
      url: 'https://github.com/yogurt',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
    {
      id: 5,
      name: 'Gingerbread',
      url: 'https://github.com/gingerbread',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Exists',
        yaml: '',
      },
    },
    {
      id: 9,
      name: 'KitKat',
      url: 'https://github.com/kitkat',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
    {
      id: 13,
      name: 'Oreo',
      url: 'https://github.com/oreo',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
  ]),
  createOrganizationData(
    103,
    'org/fruit-store-nyc',
    'https://github.com/fruit-store-nyc',
    [
      {
        id: 15,
        name: 'test-2',
        url: 'https://github.com/online-store',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Done',
          yaml: '',
        },
      },
      {
        id: 16,
        name: 'test-3',
        url: 'https://github.com/pet-app',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Failed',
          yaml: '',
        },
      },
    ],
  ),
  createOrganizationData(104, 'org/desert-1', 'https://github.com/desert', [
    {
      id: 18,
      name: 'test-6',
      url: 'https://github.com/test-6',
      organization: 'org/desert-1',
      catalogInfoYaml: {
        status: 'Exists',
        yaml: '',
      },
    },
    {
      id: 20,
      name: 'test-8',
      url: 'https://github.com/test-8',
      organization: 'org/desert-1',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
    {
      id: 21,
      name: 'test-9',
      url: 'https://github.com/test-9',
      organization: 'org/desert-1',
      catalogInfoYaml: {
        status: 'Exists',
        yaml: '',
      },
    },
    {
      id: 22,
      name: 'test-10',
      url: 'https://github.com/test-10',
      organization: 'org/desert-1',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
    {
      id: 23,
      name: 'test-11',
      url: 'https://github.com/test-11',
      organization: 'org/desert-1',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
  ]),
  createOrganizationData(
    105,
    'org/pet-store-raleigh',
    'https://github.com/pet-store-raleigh',
    [
      {
        id: 24,
        name: 'food-app-1',
        url: 'https://github.com/food-app',
        organization: 'org/pet-store-raleigh',
        catalogInfoYaml: {
          status: 'Progress',
          yaml: '',
        },
      },
    ],
  ),
  createOrganizationData(106, 'org/desert-2', 'https://github.com/desert-2', [
    {
      id: 27,
      name: 'Cupcake-2',
      url: 'https://github.com/cupcake-2',
      organization: 'org/desert-2',
      catalogInfoYaml: {
        status: 'Progress',
        yaml: '',
      },
    },
    {
      id: 28,
      name: 'Donut-2',
      url: 'https://github.com/donut-2',
      organization: 'org/desert-2',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
  ]),
];
