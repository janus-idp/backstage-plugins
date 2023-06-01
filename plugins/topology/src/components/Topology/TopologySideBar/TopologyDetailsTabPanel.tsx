import * as React from 'react';

import {
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Job,
} from '@kubernetes/client-node';
import { Split, SplitItem } from '@patternfly/react-core';
import { BaseNode } from '@patternfly/react-topology';

import {
  CronJobModel,
  DaemonSetModel,
  DeploymentModel,
  JobModel,
  PodModel,
  StatefulSetModel,
} from '../../../models';
import PodSet from '../../Pods/PodSet';
import TopologyCronJobDetails from './TopologyCronJobDetails';
import TopologyDaemonSetDetails from './TopologyDaemonSetDetails';
import TopologyDeploymentDetails from './TopologyDeploymentDetails';
import TopologyJobDetails from './TopologyJobDetails';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

import './TopologyDetailsTabPanel.css';

type TopologyDetailsTabPanelProps = { node: BaseNode };

const TopologyDetailsTabPanel = ({ node }: TopologyDetailsTabPanelProps) => {
  const { width, height } = node.getDimensions();
  const data = node.getData();
  const resource = data.resource;
  const resourceKind = resource.kind;
  const size = Math.min(width, height);
  const donutStatus = data.data?.podsData;
  const cx = width / 2;
  const cy = height / 2;

  const getWorkloadDetails = () => {
    switch (resourceKind) {
      case DeploymentModel.kind:
        return (
          <TopologyDeploymentDetails resource={resource as V1Deployment} />
        );
      case DaemonSetModel.kind:
        return <TopologyDaemonSetDetails resource={resource as V1DaemonSet} />;
      case CronJobModel.kind:
        return <TopologyCronJobDetails resource={resource as V1CronJob} />;
      case JobModel.kind:
        return <TopologyJobDetails resource={resource as V1Job} />;
      case StatefulSetModel.kind:
      case PodModel.kind:
      default:
        return <TopologyWorkloadDetails resource={resource} />;
    }
  };

  return (
    <div className="topology-details-tab" data-testid="details-tab">
      {donutStatus && (
        <Split className="topology-side-bar-pod-ring">
          <SplitItem>
            <PodSet
              size={size}
              x={cx}
              y={cy}
              data={donutStatus}
              showPodCount
              standalone
            />
          </SplitItem>
          <SplitItem isFilled />
        </Split>
      )}
      {getWorkloadDetails()}
    </div>
  );
};

export default TopologyDetailsTabPanel;
