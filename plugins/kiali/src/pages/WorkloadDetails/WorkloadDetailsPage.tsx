import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';

import {
  CardTab,
  Content,
  EmptyState,
  TabbedCard,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { BreadcrumbView } from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { TimeRange } from '../../types/Common';
import { WorkloadHealth } from '../../types/Health';
import { Workload, WorkloadQuery } from '../../types/Workload';
import { WorkloadInfo } from './WorkloadInfo';
import { WorkloadPodLogs } from './WorkloadPodLogs';

export const WorkloadDetailsPage = () => {
  const { namespace, workload } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [workloadItem, setWorkloadItem] = React.useState<Workload>();
  const [health, setHealth] = React.useState<WorkloadHealth>();
  const [error, setError] = React.useState<string>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const hasPods = workloadItem?.pods.length;

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
    if (!namespace || !workload) {
      setError(`Could not fetch workload: Empty namespace or workload name`);
      kialiState.alertUtils?.add(
        `Could not fetch workload: Empty namespace or workload name`,
      );
      return;
    }
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
      })
      .catch(err => {
        setError(`Could not fetch workload: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch workload: ${getErrorString(err)}`,
        );
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
      <>
        {workloadItem && (
          <WorkloadInfo
            workload={workloadItem}
            duration={duration}
            namespace={namespace}
            health={health}
          />
        )}
      </>
    );
  };

  const tm: TimeRange = {};
  const logsTab = (): React.ReactElement => {
    return (
      <>
        {hasPods && namespace && (
          <WorkloadPodLogs
            lastRefreshAt={duration}
            namespace={namespace}
            workload={workload ? workload : ''}
            pods={workloadItem!.pods}
            cluster={workloadItem.cluster}
            timeRange={tm}
          />
        )}
      </>
    );
  };

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView />
        <DefaultSecondaryMasthead
          elements={grids()}
          onRefresh={() => fetchWorkload()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="workload details"
            description={<div>No Workload found </div>}
          />
        )}
        {error === undefined && (
          <div style={{ marginTop: '20px' }}>
            <TabbedCard>
              <CardTab label="Overview">{overviewTab()}</CardTab>
              <CardTab label="Logs">{logsTab()}</CardTab>
            </TabbedCard>
          </div>
        )}
      </Content>
    </div>
  );
};
