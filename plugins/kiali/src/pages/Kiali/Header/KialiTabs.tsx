import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HeaderTabs } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { overviewRouteRef, workloadsRouteRef } from '../../../routes';

export const KialiTabs = () => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
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
