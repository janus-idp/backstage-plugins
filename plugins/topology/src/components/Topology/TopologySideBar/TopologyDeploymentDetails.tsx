import React from 'react';

import { V1Deployment } from '@kubernetes/client-node';

import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

type TopologyDeploymentDetailsProps = { resource: V1Deployment };

const TopologyDeploymentDetails = ({ resource }: TopologyDeploymentDetailsProps) => {
  return (
    <>
      <div className="topology-workload-details">
        <TopologyWorkloadDetails resource={resource}>
          <TopologySideBarDetailsItem label="Status">
            {resource.status?.availableReplicas === resource.status?.updatedReplicas ? (
              'Active'
            ) : (
              <div>Updating</div>
            )}
          </TopologySideBarDetailsItem>
        </TopologyWorkloadDetails>
      </div>
      <div className="topology-workload-details" data-testid="deployment-details">
        <TopologySideBarDetailsItem label="Update strategy">
          {resource.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Max unavailable">
          {`${resource.spec?.strategy?.rollingUpdate?.maxUnavailable ?? 1} of ${
            resource.spec?.replicas
          } pod`}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Max surge">
          {`${resource.spec?.strategy?.rollingUpdate?.maxSurge ?? 1} greater than ${
            resource.spec?.replicas
          } pod`}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Progress deadline seconds">
          {resource.spec?.progressDeadlineSeconds
            ? `${resource.spec.progressDeadlineSeconds} seconds`
            : 'Not configured'}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Min ready seconds">
          {resource.spec?.minReadySeconds
            ? `${resource.spec.minReadySeconds} seconds`
            : 'Not configured'}
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyDeploymentDetails;
