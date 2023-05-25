import { V1Deployment, V1OwnerReference } from '@kubernetes/client-node';
import {
  Split,
  SplitItem,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { BaseNode } from '@patternfly/react-topology';
import React from 'react';
import { DeploymentModel } from '../../../models';
import PodSet from '../../Pods/PodSet';
import TopologyDeploymentDetails from './TopologyDeploymentDetails';
import TopologyResourceLabels from './TopologyResourceLabels';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';

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
      <div className="topology-workload-details">
        <dl>
          <TopologySideBarDetailsItem label="Name">
            {resource.metadata?.name}
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Namespace">
            {resource.metadata?.namespace}
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Labels" emptyText="No labels">
            {resource.metadata?.labels && (
              <TopologyResourceLabels
                labels={resource.metadata.labels}
                dataTest="label-list"
              />
            )}
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem
            label="Annotations"
            emptyText="No annotations"
          >
            {resource.metadata?.annotations && (
              <TopologyResourceLabels
                labels={resource.metadata.annotations}
                dataTest="annotation-list"
              />
            )}
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Created at">
            <Timestamp
              date={resource.metadata?.creationTimestamp}
              dateFormat={TimestampFormat.medium}
              timeFormat={TimestampFormat.short}
            />
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Owner" emptyText="No owner">
            {resource.metadata?.ownerReferences && (
              <ul data-testid="owner-list">
                <div>
                  {(resource.metadata.ownerReferences ?? []).map(
                    (o: V1OwnerReference) => (
                      <li key={o.uid}>{o.name}</li>
                    ),
                  )}
                </div>
              </ul>
            )}
          </TopologySideBarDetailsItem>
        </dl>
      </div>
      {resourceKind === DeploymentModel.kind ? (
        <TopologyDeploymentDetails resource={resource as V1Deployment} />
      ) : null}
    </div>
  );
};

export default TopologyDetailsTabPanel;
