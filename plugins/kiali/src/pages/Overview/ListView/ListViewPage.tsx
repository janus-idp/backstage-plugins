import * as React from 'react';

import { CardTab, TabbedCard } from '@backstage/core-components';

import { ENTITY } from '../../../types/types';
import { AppListPage } from '../../AppList/AppListPage';
import { ServiceListPage } from '../../ServiceList/ServiceListPage';
import { WorkloadListPage } from '../../WorkloadList/WorkloadListPage';

export const ListViewPage = () => {
  const tabStyle: React.CSSProperties = {
    height: '600px',
    overflowY: 'scroll',
  };

  const cardStyle: React.CSSProperties = {
    marginRight: '20px',
  };

  return (
    <div style={cardStyle}>
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
      </TabbedCard>
    </div>
  );
};
