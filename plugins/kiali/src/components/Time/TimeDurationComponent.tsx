import * as React from 'react';

import { Select } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { HistoryManager, URLParam } from '../../app/History';
import { getDurationType } from '../../pages/Overview/OverviewToolbar';

type TimeControlsProps = {
  disabled: boolean;
  id: string;
  duration: string;
  label: string;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  supportsReplay?: boolean;
};

export const TimeDurationComponent: React.FC<TimeControlsProps> = (
  props: TimeControlsProps,
) => {
  const updateDurationType = (duration: number) => {
    HistoryManager.setParam(URLParam.DURATION, duration.toString());
    props.setDuration(duration);
  };

  return (
    <Grid item xs={3}>
      <Select
        onChange={e => updateDurationType(e as number)}
        label={props.label}
        items={getDurationType()}
        selected={props.duration.toString()}
      />
    </Grid>
  );
};
