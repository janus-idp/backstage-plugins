import { V1Deployment } from '@kubernetes/client-node';
import * as React from 'react';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';

import './TopologyDeploymentDetails.css';

type TopologyDeploymentDetailsProps = { resource: V1Deployment };

const TopologyDeploymentDetails = ({
  resource,
}: TopologyDeploymentDetailsProps) => {
  return (
    <div
      className="topology-deployment-details"
      data-testid="deployment-details"
    >
      <TopologySideBarDetailsItem label="Status">
        {resource.status?.availableReplicas ===
        resource.status?.updatedReplicas ? (
          'Active'
        ) : (
          <div>Updating</div>
        )}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Update strategy">
        {resource.spec?.strategy?.type}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Max unavailable">
        {`${resource.spec?.strategy?.rollingUpdate?.maxUnavailable ?? 1} of ${
          resource.spec?.replicas
        } pod`}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Max surge">
        {`${
          resource.spec?.strategy?.rollingUpdate?.maxSurge ?? 1
        } greater than ${resource.spec?.replicas} pod`}
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
  );
};

export default TopologyDeploymentDetails;
