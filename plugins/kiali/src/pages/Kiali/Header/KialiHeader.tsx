import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Header, HeaderTabs } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { Chip, Tooltip } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';

import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { homeCluster } from '../../../config';
import { overviewRouteRef, workloadsRouteRef } from '../../../routes';
import { KialiAppState, KialiContext } from '../../../store';
import { HelpKiali } from './HelpKiali';
import { NamespaceSelector } from './NamespaceSelector';

export const KialiHeader = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    { label: 'Overview', route: useRouteRef(overviewRouteRef) },
    { label: 'Workloads', route: useRouteRef(workloadsRouteRef) },
  ];
  const navigate = useNavigate();

  return (
    <>
      <Header title="Kiali" subtitle={<NamespaceSelector page />}>
        <Tooltip
          title={<div>Kiali home cluster: {homeCluster?.name}</div>}
          style={{ marginTop: '10px' }}
        >
          <Chip
            color="primary"
            icon={<ClusterIcon />}
            label={homeCluster?.name}
          />
        </Tooltip>
        <HelpKiali color="white" />
        <MessageCenter color="white" />
        {kialiState.authentication.session && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ margin: '10px', color: 'white' }}>
              <b>User : </b>
              {kialiState.authentication.session.username || 'anonymous'}
            </span>
          </div>
        )}
      </Header>
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
    </>
  );
};
