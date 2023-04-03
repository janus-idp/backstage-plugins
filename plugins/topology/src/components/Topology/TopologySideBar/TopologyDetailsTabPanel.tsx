import * as React from 'react';
import {
  Split,
  SplitItem,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import PodSet from '../../Pods/PodSet';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import { DeploymentModel } from '../../../models';
import TopologyDeploymentDetails from './TopologyDeploymentDetails';
import { V1Deployment } from '@kubernetes/client-node';
import { BaseNode } from '@patternfly/react-topology';

import './TopologyDetailsTabPanel.css';
import TopologyResourceLabels from './TopologyResourceLabels';

const TopologyDetailsTabPanel: React.FC<{ node: BaseNode }> = ({ node }) => {
  const { width, height } = node.getDimensions();
  const data = node.getData();
  const resource = data.resource;
  const resourceKind = resource.kind;
  const size = Math.min(width, height);
  const donutStatus = data?.data?.podsData;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <div className="topology-details-tab">
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
            {data?.name}
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Namespace">
            {resource.metadata?.namespace}
          </TopologySideBarDetailsItem>
          {resource.metadata.labels ? (
            <TopologySideBarDetailsItem label="Labels">
              <TopologyResourceLabels labels={resource.metadata.labels} />
            </TopologySideBarDetailsItem>
          ) : null}
          {resource.metadata.annotations ? (
            <TopologySideBarDetailsItem label="Annotations">
              <TopologyResourceLabels labels={resource.metadata.annotations} />
            </TopologySideBarDetailsItem>
          ) : null}
          <TopologySideBarDetailsItem label="Created at">
            <Timestamp
              date={resource?.metadata?.creationTimestamp}
              dateFormat={TimestampFormat.medium}
              timeFormat={TimestampFormat.short}
            />
          </TopologySideBarDetailsItem>
          <TopologySideBarDetailsItem label="Owner">
            {resource.metadata?.ownerReferences ? (
              <ul>
                <div>
                  {(Object.keys(resource.metadata.ownerReferences) ?? []).map(
                    (o: any) => (
                      <li>{o.name}</li>
                    ),
                  )}
                </div>
              </ul>
            ) : (
              <span className="no-owner">No owner</span>
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
