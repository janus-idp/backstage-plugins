import * as React from 'react';
import {
  GraphElement,
  ComponentFactory,
  withDragNode,
  withSelection,
  ModelKind,
  withPanZoom,
  GraphComponent,
  withDndDrop,
  nodeDragSourceSpec,
  graphDropTargetSpec,
  NODE_DRAG_TYPE,
} from '@patternfly/react-topology';
import GroupNode from './GroupNode';
import EdgeConnect from './EdgeConnect';
import { WorkloadNode } from './WorkloadNode';
import { TYPE_APPLICATION_GROUP, TYPE_CONNECTS_TO } from '../const';

const TopologyComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string,
): React.ComponentType<{ element: GraphElement }> | undefined => {
  if (kind === ModelKind.graph) {
    /* @ts-ignore added as Pf topology package needs to update the typings */
    return withDndDrop(graphDropTargetSpec([NODE_DRAG_TYPE]))(
      /* @ts-ignore added as Pf topology package needs to update the typings */
      withPanZoom()(GraphComponent),
    );
  }
  switch (type) {
    case 'workload':
      /* @ts-ignore added as Pf topology package needs to update the typings*/
      return withDragNode(nodeDragSourceSpec('workload', true, true))(
        /* @ts-ignore added as Pf topology package needs to update the typings*/
        withSelection()(WorkloadNode),
      );
    case TYPE_APPLICATION_GROUP:
      /* @ts-ignore added as Pf topology package needs to update the typings*/
      return withSelection()(GroupNode);
    case TYPE_CONNECTS_TO:
      /* @ts-ignore */
      return withSelection()(EdgeConnect);
    default:
      return undefined;
  }
};

export default TopologyComponentFactory;
