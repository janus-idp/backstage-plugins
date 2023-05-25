import { Edge, TaskEdge } from '@patternfly/react-topology';
import React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';
import { GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL } from '../../consts/pipeline-topology-const';

interface TaskEdgeProps {
  element: Edge;
}

const TaskGroupEdge = (props: TaskEdgeProps) => (
  <TaskEdge
    nodeSeparation={GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL}
    {...props}
  />
);

export default observer(TaskGroupEdge);
