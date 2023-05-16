import * as React from 'react';
import { V1DaemonSet } from '@kubernetes/client-node';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

const TopologyDaemonSetDetails: React.FC<{ resource: V1DaemonSet }> = ({
  resource,
}) => {
  return (
    <>
      <div className="topology-workload-details">
        <TopologyWorkloadDetails resource={resource} />
      </div>
      <div
        className="topology-workload-details"
        data-testid="daemon-set-details"
      >
        <TopologySideBarDetailsItem label="Current count">
          {resource.status?.currentNumberScheduled}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Desired count">
          {resource.status?.desiredNumberScheduled}
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyDaemonSetDetails;
