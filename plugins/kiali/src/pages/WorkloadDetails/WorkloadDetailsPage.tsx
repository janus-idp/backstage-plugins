import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Box, CircularProgress } from '@material-ui/core';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { kialiApiRef } from '../../services/Api';
import { WorkloadHealth } from '../../types/Health';
import { Workload, WorkloadQuery } from '../../types/Workload';
import { WorkloadInfo } from './WorkloadInfo';

export const WorkloadDetailsPage = () => {
  const { namespace, workload } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const [workloadItem, setWorkloadItem] = React.useState<Workload>();
  const [health, setHealth] = React.useState<WorkloadHealth>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [{ label: 'overview' }];

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="workload-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchWorkload = async () => {
    const query: WorkloadQuery = {
      health: 'true',
      rateInterval: `${duration.toString()}s`,
      validate: 'false',
    };
    kialiClient
      .getWorkload(namespace ? namespace : '', workload ? workload : '', query)
      .then((workloadResponse: Workload) => {
        setWorkloadItem(workloadResponse);
        const wkHealth = WorkloadHealth.fromJson(
          namespace ? namespace : '',
          workloadResponse.name,
          workloadResponse.health,
          {
            rateInterval: duration,
            hasSidecar: workloadResponse.istioSidecar,
            hasAmbient: workloadResponse.istioAmbient,
          },
        );
        setHealth(wkHealth);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchWorkload();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  const overviewTab = (): React.ReactElement => {
    return (
      <WorkloadInfo
        workload={workloadItem}
        duration={duration}
        namespace={namespace}
        health={health}
      />
    );
  };

  const renderTab = (): React.ReactElement => {
    switch (tabs[selectedTab].label) {
      case 'overview':
        return overviewTab();
      default:
        return overviewTab();
    }
  };

  return (
    <Page themeId="tool">
      <Content>
        <DefaultSecondaryMasthead
          elements={grids()}
          onRefresh={() => fetchWorkload()}
        />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <HeaderTabs
            selectedIndex={selectedTab}
            onChange={(index: number) => {
              setSelectedTab(index);
            }}
            tabs={tabs.map(({ label }, index) => ({
              id: index.toString(),
              label,
            }))}
          />
          {renderTab()}
        </Box>
      </Content>
    </Page>
  );
};
