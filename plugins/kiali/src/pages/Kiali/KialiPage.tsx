import React from 'react';

import { Content, Page } from '@backstage/core-components';

import { OverviewPage } from '../Overview/OverviewPage';
import { WorkloadListPage } from '../WorkloadList/WorkloadListPage';
import { KialiHeader } from './Header/KialiHeader';
import { KialiTabs } from './Header/KialiTabs';
import { KialiNoPath } from './NoPath';

const noPath = 'noPath';
const getPathPage = () => {
  const pathname = window.location.pathname.split('/').pop();
  if (pathname && pathname === 'kiali') {
    return 'overview';
  } else if (pathname) {
    return pathname;
  }
  return noPath;
};

export const KialiPage = () => {
  const [selectedTab, _] = React.useState<string>(getPathPage());

  const renderPath = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewPage />;
      case 'workloads':
        return <WorkloadListPage />;
      default:
        return <KialiNoPath />;
    }
  };

  return (
    <Page themeId="tool">
      <Content>
        <KialiHeader />
        <KialiTabs />
        {renderPath()}
      </Content>
    </Page>
  );
};
