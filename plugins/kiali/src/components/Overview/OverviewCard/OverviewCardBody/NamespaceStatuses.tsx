import React from 'react';

import { Grid } from '@material-ui/core';

import {
  DEGRADED,
  FAILURE,
  HEALTHY,
  NamespaceInfo,
  NOT_READY,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

import { switchType } from '../../../../helper';
import { OverviewStatus } from './OverviewStatus';

type NamespaceStatusesProps = {
  ns: NamespaceInfo;
  type: OverviewType;
};
export const NamespaceStatuses = (props: NamespaceStatusesProps) => {
  const name = props.ns.name;
  const status = props.ns.status;
  const nbItems = status
    ? Object.values(status).reduce((acc, val) => acc + val.length, 0)
    : 0;
  const text =
    nbItems === 1
      ? switchType(props.type, '1 application', '1 service', '1 workload')
      : nbItems +
        switchType(props.type, ' applications', ' services', ' workloads');

  const link = (
    <div
      style={{ display: 'inline-block', width: '125px', whiteSpace: 'nowrap' }}
    >
      {text}
    </div>
  );

  return nbItems === props.ns.status?.notAvailable.length ? (
    <div
      style={{ display: 'inline-block', width: '125px', whiteSpace: 'nowrap' }}
    >
      {text}
    </div>
  ) : (
    <>
      <Grid container>
        <Grid item>{link}</Grid>
        <Grid item>
          {status && status.inNotReady.length > 0 && (
            <OverviewStatus
              id={`${name}-not-ready`}
              namespace={name}
              status={NOT_READY}
              items={status.inNotReady}
            />
          )}
          {status && status.inError.length > 0 && (
            <OverviewStatus
              id={`${name}-failure`}
              namespace={name}
              status={FAILURE}
              items={status.inError}
            />
          )}
          {status && status.inWarning.length > 0 && (
            <OverviewStatus
              id={`${name}-degraded`}
              namespace={name}
              status={DEGRADED}
              items={status.inWarning}
            />
          )}
          {status && status.inSuccess.length > 0 && (
            <OverviewStatus
              id={`${name}-healthy`}
              namespace={name}
              status={HEALTHY}
              items={status.inSuccess}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};
