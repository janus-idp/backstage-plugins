import React from 'react';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarItem,
} from '@patternfly/react-core';

import { FilterContext } from '../../hooks/FilterContext';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { TopologyDisplayOption } from '../../types/types';

type TopologyToolbarProps = {
  showFilters: boolean;
};

const TopologyToolbar = ({ showFilters }: TopologyToolbarProps) => {
  const { clusters: k8sClusters, setSelectedCluster: setClusterContext } =
    React.useContext(K8sResourcesContext);

  const { filters, setAppliedTopologyFilters } =
    React.useContext(FilterContext);
  const clusterOptions = k8sClusters.map(cluster => ({
    value: cluster,
    disabled: false,
  }));
  const [clusterFilterIsExpanded, setClusterFilterIsExpanded] =
    React.useState<boolean>(false);
  const [displayOptionsIsExpanded, setDisplayOptionsIsExpanded] =
    React.useState<boolean>(false);

  const [clusterSelected, setClusterSelected] = React.useState<
    string | SelectOptionObject
  >();

  const onClusterFilterToggle = (isClusterFilterExpanded: boolean) => {
    setClusterFilterIsExpanded(isClusterFilterExpanded);
  };

  const onDisplayOptionsToggle = (isDisplayOptionsExpanded: boolean) => {
    setDisplayOptionsIsExpanded(isDisplayOptionsExpanded);
  };

  const onClusterChange = (
    _e: React.ChangeEvent | React.MouseEvent,
    selection: string | SelectOptionObject,
  ) => {
    const index = k8sClusters.findIndex(cluster => cluster === selection);
    setClusterContext(index);
    setClusterSelected(selection);
    setClusterFilterIsExpanded(false);
  };

  const onDisplayOptionChange = (
    e: React.ChangeEvent | React.MouseEvent,
    selection: string | SelectOptionObject,
  ) => {
    if (filters && filters.length !== 0) {
      const index = filters?.findIndex(f => f.id === selection);

      if (index !== undefined && index > -1) {
        const filter = {
          ...filters[index],
          value: (e.target as HTMLInputElement).checked,
        };
        setAppliedTopologyFilters?.([
          ...filters.slice(0, index),
          filter,
          ...filters.slice(index + 1),
        ] as TopologyDisplayOption[]);
      }
    }
  };

  return (
    <>
      <ToolbarItem variant="label" id="cluster-filter">
        Cluster
      </ToolbarItem>
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select Cluster"
          onToggle={onClusterFilterToggle}
          onSelect={onClusterChange}
          selections={clusterSelected}
          isOpen={clusterFilterIsExpanded}
          aria-labelledby="select-cluster"
        >
          {clusterOptions.map((option, index) => (
            <SelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
            />
          ))}
        </Select>
      </ToolbarItem>
      {showFilters && (
        <Select
          variant={SelectVariant.checkbox}
          aria-label="Display options"
          onToggle={onDisplayOptionsToggle}
          onSelect={(event, value) => onDisplayOptionChange(event, value)}
          isOpen={displayOptionsIsExpanded}
          aria-labelledby="display-options"
          placeholderText="Display options"
          customContent={filters?.map((filter, _) => (
            <SelectOption
              key={filter.id}
              value={filter.id}
              isChecked={filter.value}
            >
              {filter.label}
            </SelectOption>
          ))}
        />
      )}
    </>
  );
};

export default TopologyToolbar;
