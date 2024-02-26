import React from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { HeaderTabs } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import {
  overviewRouteRef,
  servicesRouteRef,
  workloadsRouteRef,
} from '../../../routes';

const getPath = (loc: Location): number => {
  if (loc.pathname.includes('workloads')) {
    return 1;
  }
  return 0;
};

export const KialiTabs = () => {
  const loc = useLocation();
  const path = getPath(loc);
  const [selectedTab, setSelectedTab] = React.useState<number>(path);
  const tabs = [
    { label: 'Overview', route: useRouteRef(overviewRouteRef) },
    { label: 'Workloads', route: useRouteRef(workloadsRouteRef) },
    { label: 'Services', route: useRouteRef(servicesRouteRef) },
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
