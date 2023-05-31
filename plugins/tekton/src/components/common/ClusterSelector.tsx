import React from 'react';
import { Select, SelectedItems } from '@backstage/core-components';
import { BackstageTheme } from '@backstage/theme';
import { makeStyles, Typography } from '@material-ui/core';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

import './ClusterSelector.css';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  label: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    paddingRight: '10px',
    fontWeight: 'bold',
  },
}));

export const ClusterSelector = () => {
  const classes = useStyles();
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
    <div className="bs-tkn-cluster-selector">
      <Typography className={classes.label}>Cluster</Typography>
      <Select
        onChange={onClusterChange}
        label=""
        items={clusterOptions}
        selected={clusterSelected}
        margin="dense"
        native
      />
    </div>
  );
};
