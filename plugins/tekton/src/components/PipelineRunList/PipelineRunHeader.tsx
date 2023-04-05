import { tableColumnClasses } from './pipelinerun-table';

const PipelineRunHeader = () => {
  return [
    {
      title: 'Name',
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Status',
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Task status',
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Started',
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Duration',
      props: { className: tableColumnClasses[4] },
    },
  ];
};

export default PipelineRunHeader;
