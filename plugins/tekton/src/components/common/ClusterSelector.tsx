import * as React from 'react';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { Select, SelectedItems } from '@backstage/core-components';

export const ClusterSelector: React.FC = () => {
  const {
    clusters: k8sClusters,
    selectedCluster,
    setSelectedCluster: setClusterContext,
  } = React.useContext(TektonResourcesContext);
  const clusterOptions = k8sClusters.map(cluster => ({
    value: cluster,
    label: cluster,
  }));

  const curCluster =
    selectedCluster && k8sClusters?.length > 0
      ? k8sClusters[selectedCluster]
      : k8sClusters?.[0];

  const [clusterSelected, setClusterSelected] =
    React.useState<SelectedItems>(curCluster);

  const onClusterChange = (arg: SelectedItems) => {
    const index = k8sClusters.findIndex(cluster => cluster === arg);
    setClusterContext(index);
    setClusterSelected(arg);
  };
  return (
    <Select
      onChange={onClusterChange}
      label="Cluster"
      items={clusterOptions}
      selected={clusterSelected}
      margin="dense"
    />
  );
};

export default ClusterSelector;
