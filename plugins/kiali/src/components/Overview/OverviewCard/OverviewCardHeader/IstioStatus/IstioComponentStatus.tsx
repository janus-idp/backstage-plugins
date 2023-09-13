import * as React from 'react';

import { Grid } from '@material-ui/core';

import {
  ComponentStatus,
  IStatus,
} from '@janus-idp/backstage-plugin-kiali-common';

import {
  ComponentIcon,
  createIcon,
  ErrorAddonComponent,
  ErrorCoreComponent,
  NotReadyComponent,
  SuccessComponent,
} from '../../../../Icons';

type Props = {
  componentStatus: ComponentStatus;
};

// Mapping Valid-Core to Icon representation.
const validToIcon: { [valid: string]: ComponentIcon } = {
  'false-false': ErrorAddonComponent,
  'false-true': ErrorCoreComponent,
  'true-false': SuccessComponent,
  'true-true': SuccessComponent,
};

const statusMsg = {
  [IStatus.Healthy]: 'Healthy',
  [IStatus.NotFound]: 'Not found',
  [IStatus.NotReady]: 'Not ready',
  [IStatus.Unhealthy]: 'Not healthy',
  [IStatus.Unreachable]: 'Unreachable',
};

export const IstioComponentStatus = (props: Props) => {
  const renderIcon = (status: IStatus, isCore: boolean) => {
    let compIcon = validToIcon[`${status === IStatus.Healthy}-${isCore}`];
    if (status === IStatus.NotReady) {
      compIcon = NotReadyComponent;
    }
    return createIcon(compIcon, { fontSize: 'small' });
  };

  const renderCells = () => {
    const comp = props.componentStatus;

    return [
      <li key={props.componentStatus.name}>
        <Grid container>
          <Grid item>
            {renderIcon(
              props.componentStatus.status,
              props.componentStatus.is_core,
            )}
          </Grid>
          <Grid item>{comp.name}</Grid>
          <Grid item>{statusMsg[comp.status]}</Grid>
        </Grid>
      </li>,
    ];
  };

  return renderCells();
};
