import * as React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';
import { Edge, TaskEdge } from '@patternfly/react-topology';
import { GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL } from '../../consts/pipeline-topology-const';

interface TaskEdgeProps {
  element: Edge;
}

const TaskGroupEdge: React.FunctionComponent<TaskEdgeProps> = props => (
  <TaskEdge
    nodeSeparation={GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL}
    {...props}
  />
);

export default observer(TaskGroupEdge);
