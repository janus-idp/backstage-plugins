import * as React from 'react';
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';

export const TopologyEmptyState: React.FC = () => {
  return (
    <EmptyState
      variant={EmptyStateVariant.full}
      isFullHeight
      className="pf-topology-visualization-surface"
    >
      <EmptyStateIcon variant="container" component={TopologyIcon} />
      <Title headingLevel="h3" size="lg">
        No resources found
      </Title>
    </EmptyState>
  );
};
