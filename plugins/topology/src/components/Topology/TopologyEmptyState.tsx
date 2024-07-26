import React from 'react';

import TopologyIcon from '@mui/icons-material/HubOutlined';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';

import './TopologyEmptyState.css';

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
        icon={
          <EmptyStateIcon
            icon={TopologyIcon}
            className="bs-topology-empty-state"
          />
        }
        headingLevel="h3"
      >
        <EmptyStateBody>{description}</EmptyStateBody>
      </EmptyStateHeader>
    </EmptyState>
  );
};
