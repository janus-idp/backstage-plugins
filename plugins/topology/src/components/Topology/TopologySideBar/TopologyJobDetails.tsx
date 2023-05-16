import * as React from 'react';
import { V1Job } from '@kubernetes/client-node';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

const TopologyJobDetails: React.FC<{ resource: V1Job }> = ({ resource }) => {
  return (
    <TopologyWorkloadDetails resource={resource}>
      <TopologySideBarDetailsItem label="Desired completions">
        {resource.spec?.completions}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Parallelism">
        {resource.spec?.parallelism}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Active deadline seconds">
        {resource.spec?.activeDeadlineSeconds
          ? `${resource.spec.activeDeadlineSeconds} second`
          : 'Not configured'}
      </TopologySideBarDetailsItem>
    </TopologyWorkloadDetails>
  );
};

export default TopologyJobDetails;
