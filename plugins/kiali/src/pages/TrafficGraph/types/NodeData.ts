import {
  BadgeLocation,
  GraphElement,
  LabelPosition,
  NodeShape,
  NodeStatus,
} from '@patternfly/react-topology';

import {
  BoxByType,
  DecoratedGraphNodeData,
  NodeType,
} from '../../../types/Graph';
import { DEGRADED, FAILURE } from '../../../types/Health';

export type NodeData = DecoratedGraphNodeData & {
  // These are node.data fields that have an impact on the PFT rendering of the node.
  // TODO: Is there an actual type defined for these in PFT?
  attachments?: React.ReactNode; // ie. decorators
  badge?: string;
  badgeBorderColor?: string;
  badgeClassName?: string;
  badgeColor?: string;
  badgeLocation?: BadgeLocation;
  badgeTextColor?: string;
  column?: number;
  component?: React.ReactNode;
  icon?: React.ReactNode;
  isFind?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isUnhighlighted?: boolean;
  labelIcon?: React.ReactNode;
  labelIconClass?: string;
  labelIconPadding?: number;
  labelPosition?: LabelPosition;
  marginX?: number;
  onHover?: (element: GraphElement, isMouseIn: boolean) => void;
  row?: number;
  secondaryLabel?: string;
  setLocation?: boolean;
  showContextMenu?: boolean;
  showStatusDecorator?: boolean;
  statusDecoratorTooltip?: React.ReactNode;
  truncateLength?: number;
  x?: number;
  y?: number;
};

export const getNodeStatus = (data: NodeData): NodeStatus => {
  if ((data.isBox && data.isBox !== BoxByType.APP) || data.isIdle) {
    return NodeStatus.default;
  }

  switch (data.healthStatus) {
    case DEGRADED.name:
      return NodeStatus.warning;
    case FAILURE.name:
      return NodeStatus.danger;
    default:
      return NodeStatus.success;
  }
};

export const getNodeShape = (data: NodeData): NodeShape => {
  switch (data.nodeType) {
    case NodeType.AGGREGATE:
      return NodeShape.hexagon;
    case NodeType.APP:
      return NodeShape.rect;
    case NodeType.SERVICE:
      return data.isServiceEntry ? NodeShape.trapezoid : NodeShape.rhombus;
    case NodeType.WORKLOAD:
      return NodeShape.circle;
    default:
      return NodeShape.ellipse;
  }
};
