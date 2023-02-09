import * as React from 'react';
import {
  GraphElement,
  isNode,
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  useHover,
  useVisualizationController,
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
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const WorkloadNode: React.FC<WorkloadNodeProps> = ({ element, ...rest }) => {
  if (!element || !isNode(element)) {
    return null;
  }
  const nodeElement = element as Node;

  const resource = getTopologyResourceObject(
    element.getData(),
  ) as K8sResourceKind;
  const { podData, loadError, loaded } = usePodsWatcher(
    resource,
    resource.kind,
    resource.metadata?.namespace,
  );
  const donutStatus = loaded && !loadError ? podData : null
  const { width, height } = nodeElement.getDimensions();
  const workloadData = element.getData().data;
  const [hover, hoverRef] = useHover();
  const size = Math.min(width, height);
  const { radius, decoratorRadius } = calculateRadius(size);
  const cx = width / 2;
  const cy = height / 2;
  const { decorators } = element.getGraph().getData() ?? {};
  const controller = useVisualizationController();
  const detailsLevel = controller.getGraph().getDetailsLevel();
  const showDetails =
    hover || detailsLevel !== ScaleDetailsLevel.low;
  const nodeDecorators =
    showDetails && decorators
      ? getNodeDecorators(
        nodeElement,
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
      <BaseNode
        className="tp-workload-node"
        hoverRef={hoverRef as (node: Element) => () => void}
        innerRadius={podSetInnerRadius(size, donutStatus)}
        kind={workloadData?.kind}
        element={nodeElement}
        nodeStatus={
          !showDetails
            ? getAggregateStatus(donutStatus, pipelineStatus)
            : undefined
        }
        attachments={nodeDecorators}
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
      </BaseNode>
    </g>
  );
};

export default observer(WorkloadNode);
