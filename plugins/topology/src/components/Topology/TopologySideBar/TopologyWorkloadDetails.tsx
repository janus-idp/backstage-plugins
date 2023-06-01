import * as React from 'react';

import { V1OwnerReference } from '@kubernetes/client-node';
import { Timestamp, TimestampFormat } from '@patternfly/react-core';

import { K8sWorkloadResource } from '../../../types/types';
import TopologyResourceLabels from './TopologyResourceLabels';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';

const TopologyWorkloadDetails: React.FC<{
  resource: K8sWorkloadResource;
}> = ({ resource, children }) => {
  return (
    <dl>
      <TopologySideBarDetailsItem label="Name">
        {resource.metadata?.name}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Namespace">
        {resource.metadata?.namespace}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Labels" emptyText="No labels">
        {resource.metadata?.labels && (
          <TopologyResourceLabels labels={resource.metadata.labels} dataTest="label-list" />
        )}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Annotations" emptyText="No annotations">
        {resource.metadata?.annotations && (
          <TopologyResourceLabels
            labels={resource.metadata.annotations}
            dataTest="annotation-list"
          />
        )}
      </TopologySideBarDetailsItem>
      {children}
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
              {(resource.metadata.ownerReferences ?? []).map((o: V1OwnerReference) => (
                <li key={o.uid}>{o.name}</li>
              ))}
            </div>
          </ul>
        )}
      </TopologySideBarDetailsItem>
    </dl>
  );
};

export default TopologyWorkloadDetails;
