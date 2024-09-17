import {
  ModelKind,
  withDragNode,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';

import {
  TYPE_APPLICATION_GROUP,
  TYPE_CONNECTS_TO,
  TYPE_VM,
  TYPE_WORKLOAD,
} from '../../const';
import DefaultGraph from './DefaultGraph';
import EdgeConnect from './EdgeConnect';
import GroupNode from './GroupNode';
import VMNode from './VMNode';
import WorkloadNode from './WorkloadNode';

const TopologyComponentFactory = (kind: ModelKind, type: string) => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(withSelection()(DefaultGraph));
  }
  switch (type) {
    case TYPE_VM:
      return withDragNode()(withSelection()(VMNode));
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
