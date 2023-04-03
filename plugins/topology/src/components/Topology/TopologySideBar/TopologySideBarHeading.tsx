import * as React from 'react';
import { Typography } from '@material-ui/core';
import { Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { models } from '../../../models';
import { K8sWorkloadResource } from '../../../types/types';

import './TopologySideBarHeading.css';

const TopologySideBarHeading: React.FC<{ resource: K8sWorkloadResource }> = ({
  resource,
}) => {
  const resourceName = resource.metadata?.name;
  const resourceKind = resource.kind ?? '';
  return (
    <Stack className="topology-side-bar-heading">
      <StackItem>
        <Split className="topology-side-bar-heading-label">
          {models[resourceKind] && (
            <SplitItem style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
              <span className="badge">{`${models[resourceKind].abbr}`}</span>
            </SplitItem>
          )}
          <SplitItem>
            <Typography variant="h6">{resourceName}</Typography>
          </SplitItem>
        </Split>
      </StackItem>
      {!models[resourceKind] && (
        <StackItem>
          <Typography color="textSecondary" variant="body1">
            {resourceKind}
          </Typography>
        </StackItem>
      )}
    </Stack>
  );
};

export default TopologySideBarHeading;
