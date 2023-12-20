import { TableColumn } from '@backstage/core-components';

export const PipelineRunColumnHeader: TableColumn[] = [
  {},
  {
    id: 'name',
    title: 'NAME',
    field: 'metadata.name',
  },
  {
    id: 'status',
    title: 'STATUS',
    field: 'status.conditions[0].reason',
  },
  {
    id: 'task-status',
    title: 'TASK STATUS',
    field: 'status.conditions[0].reason',
  },
  {
    id: 'start-time',
    title: 'STARTED',
    field: 'status.startTime',
    defaultSort: 'desc',
  },
  {
    id: 'duration',
    title: 'DURATION',
    field: 'status.completionTime',
  },
  {
    id: 'actions',
    title: 'ACTIONS',
  },
];
