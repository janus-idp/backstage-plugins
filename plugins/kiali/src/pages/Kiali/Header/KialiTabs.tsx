import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { HeaderTabs } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { overviewRouteRef, workloadsRouteRef } from '../../../routes';

export const KialiTabs = () => {
  const getPath = (): number => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const location = useLocation();
    if (location.pathname.includes('workloads')) {
      return 1;
    }
    return 0;
  };
  const [selectedTab, setSelectedTab] = React.useState<number>(() => getPath());
  const tabs = [
    { label: 'Overview', route: useRouteRef(overviewRouteRef) },
    { label: 'Workloads', route: useRouteRef(workloadsRouteRef) },
  ];
  const navigate = useNavigate();
  return (
    <HeaderTabs
      selectedIndex={selectedTab}
      onChange={(index: number) => {
        navigate(tabs[index].route());
        setSelectedTab(index);
      }}
      tabs={tabs.map(({ label }, index) => ({
        id: index.toString(),
        label,
      }))}
    />
  );
};
