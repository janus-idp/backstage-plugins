import * as React from 'react';
import {
  ToolbarItem,
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionObject,
} from '@patternfly/react-core';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';

const TopologyToolbar: React.FC<{
  setClusterContext: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setClusterContext }) => {
  const { clusters: k8sClusters } = React.useContext(K8sResourcesContext);
  const clusterOptions = k8sClusters.map(cluster => ({
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
    const index = k8sClusters.findIndex(cluster => cluster === selection);
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
