import React from 'react';

import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';

export const TopologyEmptyState = () => {
  return (
    <EmptyState
      variant={EmptyStateVariant.full}
      isFullHeight
      className="pf-topology-visualization-surface"
    >
      <EmptyStateHeader
        titleText="No resources found"
        icon={<EmptyStateIcon icon={TopologyIcon} />}
        headingLevel="h3"
      />
    </EmptyState>
  );
};
