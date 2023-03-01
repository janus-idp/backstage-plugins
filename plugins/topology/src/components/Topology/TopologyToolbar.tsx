import * as React from 'react';
import {
  ToolbarItem,
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionObject,
} from '@patternfly/react-core';
import { K8sResourcesClustersContext } from '../../hooks/K8sResourcesContext';

const TopologyToolbar: React.FC<{
  setClusterContext: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setClusterContext }) => {
  const clusters = React.useContext(K8sResourcesClustersContext);
  const clusterOptions = clusters.map(cluster => ({
    value: cluster,
    disabled: false,
  }));
  const [clusterFilterIsExpanded, setClusterFilterIsExpanded] =
    React.useState<boolean>(false);

  const [clusterSelected, setClusterSelected] = React.useState<
    string | SelectOptionObject
  >();

  const onClusterFilterToggle = (isClusterFilterExpanded: boolean) => {
    setClusterFilterIsExpanded(isClusterFilterExpanded);
  };

  const onClusterChange = (
    _e: React.ChangeEvent | React.MouseEvent,
    selection: string | SelectOptionObject,
  ) => {
    const index = clusters.findIndex(cluster => cluster === selection);
    setClusterContext(index);
    setClusterSelected(selection);
    setClusterFilterIsExpanded(false);
  };

  return (
    <>
      <ToolbarItem variant="label" id="cluster-filter">
        Filter by cluster
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
    </>
  );
};

export default TopologyToolbar;
