import {
  EdgeTerminalType,
  GraphElement,
  NodeStatus,
} from '@patternfly/react-topology';

import { DecoratedGraphEdgeData } from '../../../types/Graph';
import { Span } from '../../../types/Tracing';

export type EdgeData = DecoratedGraphEdgeData & {
  endTerminalType: EdgeTerminalType;
  hasSpans?: Span[];
  isFind?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isUnhighlighted?: boolean;
  onHover?: (element: GraphElement, isMouseIn: boolean) => void;
  pathStyle?: React.CSSProperties;
  tag?: string;
  tagStatus?: NodeStatus;
};
