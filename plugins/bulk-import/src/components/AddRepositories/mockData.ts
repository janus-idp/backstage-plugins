import { createData } from '../../utils/repository-utils';

export const getDataForRepositories = () => [
  createData(
    1,
    'Cupcake',
    'https://github.com/cupcake',
    'Progress',
    'org/cupcake',
    3,
  ),
  createData(2, 'Donut', 'https://github.com/donut', 'Done', 'org/donut'),
  createData(
    3,
    'Eclair',
    'https://github.com/eclair',
    'Failed',
    'org/eclair',
    2,
  ),
  createData(
    4,
    'Frozen yoghurt',
    'https://github.com/yogurt',
    '',
    'org/yogurt',
    0,
  ),
  createData(
    5,
    'Gingerbread',
    'https://github.com/gingerbread',
    'Exists',
    'org/gingerbread',
    0,
  ),
  createData(9, 'KitKat', 'https://github.com/kitkat', '', 'org/kitkat', 0),
  createData(13, 'Oreo', 'https://github.com/oreo', '', 'org/oreo', 0),
];
