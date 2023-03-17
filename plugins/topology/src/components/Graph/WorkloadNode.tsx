import * as React from 'react';
import {
  getDefaultShapeDecoratorCenter,
  GraphElement,
  isNode,
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  TopologyQuadrant,
  useHover,
  useVisualizationController,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import BaseNode from './BaseNode';
import PodSet, { podSetInnerRadius } from '../Pods/PodSet';
import { AllPodStatus } from '../Pods/pod';
import { calculateRadius, getPodStatus } from '../../utils/workload-node-utils';
import { UrlDecorator } from './decorators/UrlDecorator';

import './WorkloadNode.css';

const POD_STATUS_NORMAL = 1;
const POD_STATUS_WARNING = 2;
const POD_STATUS_DANGER = 3;

const getNodePodStatus = (podStatus: AllPodStatus): number => {
  switch (podStatus) {
    case AllPodStatus.Failed:
    case AllPodStatus.CrashLoopBackOff:
    case AllPodStatus.ErrImagePull:
      return POD_STATUS_DANGER;
    case AllPodStatus.Warning:
      return POD_STATUS_WARNING;
    default:
      return POD_STATUS_NORMAL;
  }
};

const getAggregateStatus = (donutStatus: any): NodeStatus => {
  const worstPodStatus =
    donutStatus?.pods?.reduce((acc: any, pod: any) => {
      return Math.max(acc, getNodePodStatus(getPodStatus(pod)));
    }, POD_STATUS_NORMAL) ?? NodeStatus.default;

  if (worstPodStatus === POD_STATUS_DANGER) {
    return NodeStatus.danger;
  }
  if (worstPodStatus === POD_STATUS_WARNING) {
    return NodeStatus.warning;
  }
  return NodeStatus.default;
};

type InnerWorkloadNodeProps = {
  element: Node;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const InnerWorkloadNode: React.FC<InnerWorkloadNodeProps> = observer(
  ({ element, ...rest }) => {
    const data = element.getData();
    const { width, height } = element.getDimensions();
    const workloadData = data.data;
    const donutStatus = workloadData.podsData;
    const [hover, hoverRef] = useHover();
    const size = Math.min(width, height);
    const { decoratorRadius } = calculateRadius(size);
    const cx = width / 2;
    const cy = height / 2;
    const controller = useVisualizationController();
    const detailsLevel = controller.getGraph().getDetailsLevel();
    const showDetails = hover || detailsLevel !== ScaleDetailsLevel.low;

    const urlDecorator = React.useMemo(() => {
      if (!workloadData?.url) {
        return null;
      }
      const { x, y } = getDefaultShapeDecoratorCenter(
        TopologyQuadrant.upperRight,
        element,
      );
      const offset = decoratorRadius * 0.4;
      return (
        <UrlDecorator
          url={workloadData.url}
          radius={decoratorRadius}
          x={x + offset}
          y={y - offset}
        />
      );
    }, [workloadData?.url, element, decoratorRadius]);

    return (
      <g className="tp-workload-node">
        <BaseNode
          className="tp-workload-node"
          hoverRef={hoverRef as (node: Element) => () => void}
          innerRadius={podSetInnerRadius(size, donutStatus)}
          kind={workloadData?.kind}
          element={element}
          nodeStatus={
            !showDetails ? getAggregateStatus(donutStatus) : undefined
          }
          attachments={showDetails && urlDecorator}
          {...rest}
        >
          {donutStatus && showDetails ? (
            <PodSet size={size} x={cx} y={cy} data={donutStatus} showPodCount />
          ) : null}
        </BaseNode>
      </g>
    );
  },
);

type WorkloadNodeProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const WorkloadNode: React.FC<WorkloadNodeProps> = ({ element, ...rest }) =>
  !element || !isNode(element) ? null : (
    <InnerWorkloadNode element={element} {...rest} />
  );

export default WorkloadNode;
