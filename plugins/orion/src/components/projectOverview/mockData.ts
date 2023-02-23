import { ProjectType } from './types';

export const mockProjects: ProjectType[] = [
  /* TODO: https://issues.redhat.com/browse/FLPATH-52 */
  {
    id: '1',
    name: 'Project 1',
    username: 'User 1',
    description: 'Description 1',
    createdDate: '2021-01-01',
    modifyDate: '2021-01-01',
    status: 'in-progress',
  },
  {
    id: '2',
    name: 'Project 2',
    username: 'User 2',
    description: 'Description 2',
    createdDate: '2021-01-01',
    modifyDate: '2021-01-01',
    status: 'on-boarded',
  },
  {
    id: '3',
    name: 'Project 3',
    username: 'User 3',
    description: 'Description 3',
    createdDate: '2021-01-01',
    modifyDate: '2021-01-01',
    status: 'in-progress',
  },
];
