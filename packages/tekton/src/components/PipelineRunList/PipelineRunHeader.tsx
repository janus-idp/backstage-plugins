import { sortable } from '@patternfly/react-table';
import { tableColumnClasses } from './pipelinerun-table';

const PipelineRunHeader = () => {
  return [
    {
      title: 'NAME',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'STATUS',
      sortField: 'status.conditions[0].reason',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'TASK STATUS',
      sortField: 'status.conditions[0].reason',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'STARTED',
      sortField: 'status.startTime',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'DURATION',
      sortField: 'status.completionTime',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
  ];
};

export default PipelineRunHeader;
