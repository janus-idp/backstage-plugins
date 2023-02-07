import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import {
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  useHover,
  useVisualizationController,
  WithContextMenuProps,
  WithCreateConnectorProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import BaseNode from './BaseNode';
import PodSet, { podSetInnerRadius } from './Pods/PodSet';
import { AllPodStatus } from './Pods/pod';
import { calculateRadius, getPodStatus } from '../utils/workloadNodeUtils';
import { getNodeDecorators } from '../utils/getWorkloadNodeDecorators';
import { getTopologyResourceObject } from '../utils/topology-utils';
import { usePodsWatcher } from '../hooks/usePodsWatcher';
import { K8sResourceKind } from '../types/types';
import { PodRCData } from '../types/pods';

import './WorkloadNode.css';

const POD_STATUS_NORMAL = 1;
const POD_STATUS_WARNING = 2;
const POD_STATUS_DANGER = 3;

const StatusSeverities = {
  danger: [
    'ContainerCannotRun',
    'CrashLoopBackOff',
    'Critical',
    'ErrImagePull',
    'Error',
    'Failed',
    'Failure',
    'ImagePullBackOff',
    'InstallCheckFailed',
    'Lost',
    'Rejected',
    'UpgradeFailed',
  ],
  warning: [
    'Cancelled',
    'Deleting',
    'Expired',
    'Not Ready',
    'Terminating',
    'Warning',
    'RequiresApproval',
  ],
  normal: [
    'New',
    'Pending',
    'Planning',
    'ContainerCreating',
    'UpgradePending',
    'In Progress',
    'Installing',
    'InstallReady',
    'Replacing',
    'Running',
    'Updating',
    'Upgrading',
    'Accepted',
    'Active',
    'Bound',
    'Complete',
    'Completed',
    'Created',
    'Enabled',
    'Succeeded',
    'Ready',
    'Up to date',
    'Provisioned as node',
    'Preferred',
    'Connected',
    'Info',
    'Unknown',
    'PipelineNotStarted',
  ],
};

export const getNodePodStatus = (podStatus: AllPodStatus): number => {
  switch (podStatus) {
    case AllPodStatus.Failed:
    case AllPodStatus.CrashLoopBackOff:
      return POD_STATUS_DANGER;
    case AllPodStatus.Warning:
      return POD_STATUS_WARNING;
    default:
      return POD_STATUS_NORMAL;
  }
};

export const getAggregateStatus = (
  donutStatus: any,
  pipelineStatus: string,
): NodeStatus => {
  const worstPodStatus =
    donutStatus?.pods?.reduce((acc: any, pod: any) => {
      return Math.max(acc, getNodePodStatus(getPodStatus(pod)));
    }, POD_STATUS_NORMAL) ?? NodeStatus.default;

  if (
    worstPodStatus === POD_STATUS_DANGER ||
    StatusSeverities.danger.includes(pipelineStatus)
  ) {
    return NodeStatus.danger;
  }
  if (
    worstPodStatus === POD_STATUS_WARNING ||
    StatusSeverities.warning.includes(pipelineStatus)
  ) {
    return NodeStatus.warning;
  }
  return NodeStatus.default;
};

type WorkloadNodeProps = {
  element: Node;
  dragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  urlAnchorRef?: React.Ref<SVGCircleElement>;
  dropTooltip?: React.ReactNode;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

type WorkloadPodsNodeProps = WorkloadNodeProps & {
  donutStatus: PodRCData;
};

const WorkloadPodsNode: React.FC<WorkloadPodsNodeProps> = observer(
  function WorkloadPodsNode({
    donutStatus,
    element,
    children,
    urlAnchorRef,
    canDrop,
    dropTarget,
    dropTooltip,
    contextMenuOpen,
    ...rest
  }) {
    const { width, height } = element.getDimensions();
    const workloadData = element.getData().data;
    const [hover, hoverRef] = useHover();
    const size = Math.min(width, height);
    const { radius, decoratorRadius } = calculateRadius(size);
    const cx = width / 2;
    const cy = height / 2;
    const tipContent = dropTooltip || 'Create a visual connector';
    const { decorators } = element.getGraph().getData() ?? {};
    const controller = useVisualizationController();
    const detailsLevel = controller.getGraph().getDetailsLevel();
    const showDetails =
      hover || contextMenuOpen || detailsLevel !== ScaleDetailsLevel.low;
    const nodeDecorators =
      showDetails && decorators
        ? getNodeDecorators(
            element,
            decorators,
            cx,
            cy,
            radius,
            decoratorRadius,
          )
        : null;
    const pipelineStatus =
      element.getData()?.resources?.pipelineRunStatus ?? 'Unknown';

    return (
      <g className="tp-workload-node">
        <Tooltip
          content={tipContent}
          trigger="manual"
          isVisible={dropTarget && canDrop}
          animationDuration={0}
        >
          <BaseNode
            className="tp-workload-node"
            hoverRef={hoverRef as (node: Element) => () => void}
            innerRadius={podSetInnerRadius(size, donutStatus)}
            kind={workloadData?.kind}
            element={element}
            dropTarget={dropTarget}
            canDrop={canDrop}
            nodeStatus={
              !showDetails
                ? getAggregateStatus(donutStatus, pipelineStatus)
                : undefined
            }
            attachments={nodeDecorators}
            contextMenuOpen={contextMenuOpen}
            {...rest}
          >
            {donutStatus && showDetails ? (
              <PodSet
                size={size}
                x={cx}
                y={cy}
                data={donutStatus}
                showPodCount
              />
            ) : null}
            {children}
          </BaseNode>
        </Tooltip>
      </g>
    );
  },
);

const WorkloadNode: React.FC<WorkloadNodeProps> = observer(
  function WorkloadNode({ element, ...rest }) {
    const resource = getTopologyResourceObject(
      element.getData(),
    ) as K8sResourceKind;
    const { podData, loadError, loaded } = usePodsWatcher(
      resource,
      resource.kind,
      resource.metadata?.namespace,
    );
    return (
      <WorkloadPodsNode
        element={element}
        donutStatus={loaded && !loadError ? podData : null}
        {...rest}
      />
    );
  },
);

export { WorkloadNode, WorkloadPodsNode };
