import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { CardTab, TabbedCard } from '@backstage/core-components';

import { ENTITY } from '../../../types/types';
import { AppListPage } from '../../AppList/AppListPage';
import { ServiceListPage } from '../../ServiceList/ServiceListPage';
import { WorkloadListPage } from '../../WorkloadList/WorkloadListPage';

export const ListViewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tabresources');
  const [tab, setTab] = React.useState<string>(tabParam || 'workloads');

  const updateTab = (tabvalue: string) => {
    setTab(tabvalue);
    setSearchParams({ ['tabresources']: tabvalue });
  };
  const tabStyle: React.CSSProperties = {
    height: '600px',
    overflowY: 'scroll',
  };

  const cardStyle: React.CSSProperties = {
    marginRight: '20px',
  };

  return (
    <div style={cardStyle}>
      <TabbedCard value={tab} title="Resources">
        <CardTab
          value="workloads"
          onClick={() => updateTab('workloads')}
          label="Workloads"
        >
          <div style={tabStyle}>
            <WorkloadListPage view={ENTITY} />
          </div>
        </CardTab>
        <CardTab
          value="services"
          onClick={() => updateTab('services')}
          label="Services"
        >
          <div style={tabStyle}>
            <ServiceListPage view={ENTITY} />
          </div>
        </CardTab>
        <CardTab
          value="applications"
          onClick={() => updateTab('applications')}
          label="Applications"
        >
          <div style={tabStyle}>
            <AppListPage view={ENTITY} />
          </div>
        </CardTab>
      </TabbedCard>
    </div>
  );
};
