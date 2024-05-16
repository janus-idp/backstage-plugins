import React from 'react';

import { V1Container } from '@kubernetes/client-node';
import { MenuItem, Select } from '@material-ui/core';

import ResourceName from '../../../../common/components/ResourceName';

type ContainerSelectorType = {
  containersList: V1Container[];
  containerSelected: string;
  onContainerChange: (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>,
    child: React.ReactNode,
  ) => void;
};

export const ContainerSelector = ({
  containersList,
  containerSelected,
  onContainerChange,
}: ContainerSelectorType) => {
  return (
    <Select
      onChange={onContainerChange}
      label="Container"
      style={{ marginLeft: '20px' }}
      value={containerSelected}
      data-testid="container-select"
    >
      {containersList.map(container => {
        return (
          <MenuItem value={container.name} key={container.name}>
            <ResourceName name={container.name} kind="Container" />
          </MenuItem>
        );
      })}
    </Select>
  );
};
