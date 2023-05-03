import * as React from 'react';
import {
  GraphElement,
  ComponentFactory,
  withDragNode,
  withSelection,
  ModelKind,
  withPanZoom,
} from '@patternfly/react-topology';
import GroupNode from './GroupNode';
import EdgeConnect from './EdgeConnect';
import WorkloadNode from './WorkloadNode';
import {
  TYPE_APPLICATION_GROUP,
  TYPE_CONNECTS_TO,
  TYPE_WORKLOAD,
} from '../../const';
import DefaultGraph from './DefaultGraph';

const TopologyComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string,
): React.ComponentType<{ element: GraphElement }> | undefined => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(withSelection()(DefaultGraph));
  }
  switch (type) {
    case TYPE_WORKLOAD:
      return withDragNode()(withSelection()(WorkloadNode));
    case TYPE_APPLICATION_GROUP:
      return withDragNode()(withSelection()(GroupNode));
    case TYPE_CONNECTS_TO:
      return withSelection()(EdgeConnect);
    default:
      return undefined;
  }
};

export default TopologyComponentFactory;
