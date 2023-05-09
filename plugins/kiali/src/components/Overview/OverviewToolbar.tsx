import React from 'react';

import { Select, SelectItem } from '@backstage/core-components';

import { Grid, IconButton, Tooltip } from '@material-ui/core';
import Refresh from '@material-ui/icons/Refresh';

import {
  durationsTuples,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

declare const directionTypes: {
  inbound: string;
  outbound: string;
};
export type DirectionType = keyof typeof directionTypes;

type OverviewTypeOptions = 'app' | 'workload' | 'service';
type DirectionTypeOptions = 'inbound' | 'outbound';

type OverviewToolbarProps = {
  direction: DirectionType;
  setDirection: (e: DirectionTypeOptions) => void;
  duration: number;
  setDuration: (e: number) => void;
  overviewType: OverviewType;
  setOverviewType: (e: OverviewTypeOptions) => void;
  refresh: () => void;
};

const healthType = [
  {
    label: 'Apps',
    value: 'app',
  },
  {
    label: 'Workloads',
    value: 'workload',
  },
  {
    label: 'Services',
    value: 'service',
  },
];

const directionType = [
  {
    label: 'Inbound',
    value: 'inbound',
  },
  {
    label: 'Outbound',
    value: 'outbound',
  },
];

const getDurationType = (): SelectItem[] => {
  const items: SelectItem[] = [];
  durationsTuples.forEach((value, _) =>
    items.push({
      label: `Last ${value[1]}`,
      value: value[0],
    }),
  );
  return items;
};

export const OverviewToolbar = (props: OverviewToolbarProps) => {
  return (
    <Grid container spacing={3} direction="row">
      <Grid item xs={3}>
        <Select
          onChange={e => props.setOverviewType(e as OverviewTypeOptions)}
          label="Health for"
          items={healthType}
          selected={props.overviewType}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          onChange={e => props.setDirection(e as DirectionTypeOptions)}
          label="Traffic"
          items={directionType}
          selected={props.direction}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          onChange={e => props.setDuration(e as number)}
          label="Metrics from"
          items={getDurationType()}
          selected={props.duration}
        />
      </Grid>
      <Grid item xs={2} />
      <Grid item xs={1}>
        <Tooltip title="Refresh" style={{ marginTop: '20px' }}>
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            onClick={props.refresh}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
