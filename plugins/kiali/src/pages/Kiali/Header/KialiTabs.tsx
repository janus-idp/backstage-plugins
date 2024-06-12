import React from 'react';
import { Location, useLocation } from 'react-router-dom';

import { HeaderTabs } from '@backstage/core-components';

import {
  appsRouteRef,
  istioConfigRouteRef,
  overviewRouteRef,
  servicesRouteRef,
  workloadsRouteRef,
} from '../../../routes';

const getPath = (loc: Location): number => {
  if (loc.pathname.includes('workloads')) {
    return 1;
  }
  if (loc.pathname.includes('services')) {
    return 2;
  }
  if (loc.pathname.includes('applications')) {
    return 3;
  }
  if (loc.pathname.includes('istio')) {
    return 4;
  }
  return 0;
};

export const KialiTabs = () => {
  const loc = useLocation();
  const path = getPath(loc);
  const [selectedTab, setSelectedTab] = React.useState<number>(path);
  const tabs = [
    { label: 'Overview', route: overviewRouteRef.path },
    { label: 'Workloads', route: workloadsRouteRef.path },
    { label: 'Services', route: servicesRouteRef.path },
    { label: 'Applications', route: appsRouteRef.path },
    { label: 'Istio Config', route: istioConfigRouteRef.path },
  ];

  return (
    <HeaderTabs
      selectedIndex={selectedTab}
      onChange={(index: number) => {
        setSelectedTab(index);
      }}
      tabs={tabs.map(({ label }, index) => ({
        id: tabs[index].route,
        label,
      }))}
    />
  );
};
