import React, { ChangeEvent } from 'react';

import { Content, Page } from '@backstage/core-components';

import { Tab } from '@material-ui/core';
import { TabContext, TabList } from '@material-ui/lab';

import { OverviewPage } from '../Overview/OverviewPage';
import { KialiHeader } from './Header/KialiHeader';
import { WorkloadListPage } from '../WorkloadList/WorkloadListPage';
import { KialiNoPath } from './NoPath';

const noPath = 'noPath';
const getPathPage = () => {
  const pathname = window.location.pathname.split('/').pop();
  if (pathname && pathname === 'kiali') {
    return 'workloads';
  } else if (pathname) {
    return pathname;
  }
  return noPath;
};

export const KialiPage = () => {
  const [kialiTab, setTab] = React.useState<string>(getPathPage());

  const renderPath = () => {
    switch (kialiTab) {
      case 'overview':
        return <OverviewPage />;
      case 'workloads':
        return <WorkloadListPage />;
      default:
        return <KialiNoPath />;
    }
  };

  const handleChange = (_: ChangeEvent<{}>, value: any) => {
    setTab(value);
  };

  return (
    <Page themeId="tool">
      <Content>
        <KialiHeader />
        <TabContext value={kialiTab}>
          <TabList onChange={handleChange}>
            <Tab label="Overview" value="overview" />
            <Tab label="Workloads" value="workloads" />
          </TabList>
        </TabContext>
        {renderPath()}
      </Content>
    </Page>
  );
};
