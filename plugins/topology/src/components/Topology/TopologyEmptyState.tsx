import React from 'react';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';

type TopologyEmptyStateProps = {
  title?: string;
  description?: string;
};

export const TopologyEmptyState = ({
  title,
  description,
}: TopologyEmptyStateProps) => {
  return (
    <EmptyState
      variant={EmptyStateVariant.full}
      isFullHeight
      className="pf-topology-visualization-surface"
    >
      <EmptyStateHeader
        titleText={title || 'No resources found'}
        icon={<EmptyStateIcon icon={TopologyIcon} />}
        headingLevel="h3"
      >
        <EmptyStateBody>{description}</EmptyStateBody>
      </EmptyStateHeader>
    </EmptyState>
  );
};
