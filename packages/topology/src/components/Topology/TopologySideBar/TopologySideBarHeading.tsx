import React from 'react';

import { Typography } from '@material-ui/core';
import { Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import ResourceName from '../../../common/components/ResourceName';
import { resourceModels } from '../../../models';
import { K8sWorkloadResource } from '../../../types/types';

import './TopologySideBarHeading.css';

type TopologySideBarHeadingProps = { resource: K8sWorkloadResource };

const TopologySideBarHeading = ({ resource }: TopologySideBarHeadingProps) => {
  const resourceName = resource.metadata?.name;
  const resourceKind = resource.kind ?? '';
  return (
    <Stack className="topology-side-bar-heading">
      <StackItem>
        <Split className="topology-side-bar-heading-label">
          {resourceModels[resourceKind] ? (
            <SplitItem style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
              <ResourceName
                kind={resourceKind}
                name={resourceName ?? ''}
                large
              />
            </SplitItem>
          ) : (
            <SplitItem>
              <Typography variant="h6">{resourceName}</Typography>
            </SplitItem>
          )}
        </Split>
      </StackItem>
      {!resourceModels[resourceKind] && (
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
