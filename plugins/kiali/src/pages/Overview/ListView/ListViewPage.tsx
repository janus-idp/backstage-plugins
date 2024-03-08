import * as React from 'react';

import { CardTab, TabbedCard } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { baseStyle } from '../../../styles/StyleUtils';
import { ENTITY } from '../../../types/types';
import { AppListPage } from '../../AppList/AppListPage';
import { IstioConfigListPage } from '../../IstioConfigList/IstioConfigListPage';
import { ServiceListPage } from '../../ServiceList/ServiceListPage';
import { WorkloadListPage } from '../../WorkloadList/WorkloadListPage';

export const ListViewPage = () => {
  const tabStyle: React.CSSProperties = {
    height: '600px',
    overflowY: 'scroll',
    margin: '-15px',
  };

  return (
    <Grid container>
      <Grid key="Card_" xs={6} style={{ margin: '8px' }}>
        <div className={baseStyle}>
          <div>
            <TabbedCard title="Resources">
              <CardTab label="Workloads">
                <div style={tabStyle}>
                  <WorkloadListPage view={ENTITY} />
                </div>
              </CardTab>
              <CardTab label="Services">
                <div style={tabStyle}>
                  <ServiceListPage view={ENTITY} />
                </div>
              </CardTab>
              <CardTab label="Applications">
                <div style={tabStyle}>
                  <AppListPage view={ENTITY} />
                </div>
              </CardTab>
              <CardTab label="Istio Config">
                <div style={tabStyle}>
                  <IstioConfigListPage view={ENTITY} />
                </div>
              </CardTab>
            </TabbedCard>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};
