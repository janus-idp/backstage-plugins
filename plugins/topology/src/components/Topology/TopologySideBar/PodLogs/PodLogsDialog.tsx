import React, { useState } from 'react';

import { ErrorBoundary } from '@backstage/core-components';

import { V1Pod } from '@kubernetes/client-node';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Button } from '@patternfly/react-core';

import ResourceName from '../../../../common/components/ResourceName';
import { K8sResourcesContext } from '../../../../hooks/K8sResourcesContext';
import { ContainerSelector } from './ContainerSelector';
import { PodLogs } from './PodLogs';
import { ContainerScope } from './types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type PodLogsDialogProps = {
  podData: V1Pod;
};

export const PodLogsDialog = ({ podData }: PodLogsDialogProps) => {
  const { clusters, selectedCluster } = React.useContext(K8sResourcesContext);
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);

  const curCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';
  const { name: podName = '', namespace: podNamespace = '' } =
    podData?.metadata || {};
  const containersList = podData.spec?.containers || [];

  const curContainer =
    (containersList?.length && (containersList?.[0].name as string)) || '';

  const [containerSelected, setContainerSelected] =
    React.useState<string>(curContainer);
  const [podScope, setPodScope] = React.useState<ContainerScope>({
    containerName: curContainer,
    podName,
    podNamespace: podNamespace,
    clusterName: curCluster,
  });

  const onContainerChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    setContainerSelected(event.target.value as string);
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (containerSelected) {
      setPodScope(ps => ({
        ...ps,
        containerName: containerSelected as string,
      }));
    }
  }, [containerSelected]);

  if (!podName || !podNamespace || !curCluster) {
    return null;
  }

  return (
    <>
      <Dialog maxWidth="xl" fullWidth open={open} onClose={closeDialog}>
        <DialogTitle id="dialog-title">
          <Box className={classes.titleContainer}>
            <ResourceName name={podName} kind={podData.kind as string} />
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={closeDialog}
            >
              <CloseIcon />
            </IconButton>
            <ContainerSelector
              containersList={containersList}
              onContainerChange={onContainerChange}
              containerSelected={containerSelected}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <ErrorBoundary>
            <PodLogs podScope={podScope} />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
      <Button
        style={{ padding: 0 }}
        variant="link"
        aria-label="view logs"
        onClick={openDialog}
      >
        View Logs
      </Button>
    </>
  );
};
