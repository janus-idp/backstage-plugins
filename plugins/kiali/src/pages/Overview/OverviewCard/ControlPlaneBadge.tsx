import * as React from 'react';

import { Chip, makeStyles } from '@material-ui/core';

import { AmbientBadge } from '../../../components/Ambient/AmbientBadge';
import { IstioStatusInline } from '../../../components/IstioStatus/IstioStatusInline';
import { serverConfig } from '../../../config';
import { ComponentStatus } from '../../../types/IstioStatus';
import { isRemoteCluster } from './OverviewCardControlPlaneNamespace';
import { RemoteClusterBadge } from './RemoteClusterBadge';

type Props = {
  cluster?: string;
  annotations?: { [key: string]: string };
  status: ComponentStatus[];
};

const useStyles = makeStyles(() => ({
  controlPlane: {
    backgroundColor: '#f3faf2',
    color: '#1e4f18',
    marginLeft: '5px',
  },
}));

export const ControlPlaneBadge = (props: Props): React.JSX.Element => {
  const classes = useStyles();
  return (
    <>
      <Chip
        label="Control plane"
        size="small"
        className={classes.controlPlane}
        color="default"
        variant="outlined"
      />
      {isRemoteCluster(props.annotations) && <RemoteClusterBadge />}
      {serverConfig.ambientEnabled && (
        <AmbientBadge tooltip="Istio Ambient ztunnel detected in the Control plane" />
      )}{' '}
      <IstioStatusInline {...props} />
    </>
  );
};
