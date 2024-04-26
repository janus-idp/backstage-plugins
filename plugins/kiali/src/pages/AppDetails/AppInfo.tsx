import React from 'react';

import { Grid } from '@material-ui/core';

import { App } from '../../types/App';
import { DurationInSeconds } from '../../types/Common';
import { AppHealth } from '../../types/Health';
import { ENTITY } from '../../types/types';
import { AppDescription } from './AppDescription';

type AppInfoProps = {
  app?: App;
  duration: DurationInSeconds;
  health?: AppHealth;
  view?: string;
};

export const AppInfo = (appProps: AppInfoProps) => {
  const size = appProps.view === ENTITY ? 12 : 4;
  return (
    <Grid container spacing={1} style={{ paddingTop: '20px' }}>
      <Grid key={`Card_${appProps.app?.name}`} item xs={size}>
        <AppDescription app={appProps.app} health={appProps.health} />
      </Grid>
    </Grid>
  );
};
