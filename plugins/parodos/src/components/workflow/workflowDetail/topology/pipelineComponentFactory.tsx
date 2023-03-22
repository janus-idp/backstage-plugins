import * as React from 'react';
import {
  ComponentFactory,
  DEFAULT_EDGE_TYPE,
  DEFAULT_FINALLY_NODE_TYPE,
  DEFAULT_SPACER_NODE_TYPE,
  DEFAULT_TASK_NODE_TYPE,
  DefaultTaskGroup,
  GraphComponent,
  GraphElement,
  ModelKind,
  SpacerNode,
  TaskEdge,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import DemoTaskNode from './DemoTaskNode';
import DemoTaskGroupEdge from './DemoTaskGroupEdge';

export const GROUPED_EDGE_TYPE = 'GROUPED_EDGE';

const pipelineComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string,
): React.ComponentType<{ element: GraphElement }> | any | undefined => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(GraphComponent);
  }
  switch (type) {
    case DEFAULT_TASK_NODE_TYPE:
      return withSelection()(DemoTaskNode);
    case DEFAULT_FINALLY_NODE_TYPE:
      return withSelection()(DemoTaskNode);
    case 'task-group':
      return DefaultTaskGroup;
    case 'finally-group':
      return DefaultTaskGroup;
    case DEFAULT_SPACER_NODE_TYPE:
      return SpacerNode;
    case 'finally-spacer-edge':
    case DEFAULT_EDGE_TYPE:
      return TaskEdge;
    case GROUPED_EDGE_TYPE:
      return DemoTaskGroupEdge;
    default:
      return undefined;
  }
};

export default pipelineComponentFactory;
