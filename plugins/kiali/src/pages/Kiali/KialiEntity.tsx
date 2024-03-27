import React from 'react';

import { Content } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { baseStyle } from '../../styles/StyleUtils';
import { IstioConfigCard } from '../Overview/IstioConfigCard';
import { ListViewPage } from '../Overview/ListView/ListViewPage';
import { OverviewPage } from '../Overview/OverviewPage';

export const KialiEntity = () => {
  return (
    <div className={baseStyle}>
      <Content>
        <Grid container>
          <Grid xs={12}>
            <OverviewPage entity />
          </Grid>
          <Grid xs={6}>
            <ListViewPage />
          </Grid>
          <Grid xs={6}>
            <IstioConfigCard />
          </Grid>
        </Grid>
      </Content>
    </div>
  );
};
