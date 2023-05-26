import * as React from 'react';
import { V1CronJob } from '@kubernetes/client-node';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';
import { Timestamp, TimestampFormat } from '@patternfly/react-core';

const TopologyCronJobDetails: React.FC<{ resource: V1CronJob }> = ({
  resource,
}) => {
  return (
    <TopologyWorkloadDetails resource={resource}>
      <TopologySideBarDetailsItem label="Schedule">
        {resource.spec?.schedule}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Concurrency policy">
        {resource.spec?.concurrencyPolicy}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label="Starting deadline seconds"
        emptyText="Not configured"
      >
        {resource.spec?.startingDeadlineSeconds &&
          (resource.spec.startingDeadlineSeconds > 1
            ? `${resource.spec.startingDeadlineSeconds} seconds`
            : `${resource.spec.startingDeadlineSeconds} second`)}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Last schedule time" emptyText="-">
        {resource.status?.lastScheduleTime && (
          <Timestamp
            date={resource.status?.lastScheduleTime}
            dateFormat={TimestampFormat.medium}
            timeFormat={TimestampFormat.short}
          />
        )}
      </TopologySideBarDetailsItem>
    </TopologyWorkloadDetails>
  );
};

export default TopologyCronJobDetails;
