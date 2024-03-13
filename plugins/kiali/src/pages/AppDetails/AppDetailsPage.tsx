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
import { AxiosError } from 'axios';

import { HistoryManager } from '../../app/History';
import { BreadcrumbView } from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { IstioMetrics } from '../../components/Metrics/IstioMetrics';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiContext } from '../../store';
import { KialiAppState } from '../../store/Store';
import { baseStyle } from '../../styles/StyleUtils';
import { App, AppQuery } from '../../types/App';
import { AppHealth } from '../../types/Health';
import { MetricsObjectTypes } from '../../types/Metrics';
import { AppInfo } from './AppInfo';

export const AppDetailsPage = () => {
  const { namespace, app } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [appItem, setAppItem] = React.useState<App>();
  const [health, setHealth] = React.useState<AppHealth>();
  const [error, setError] = React.useState<string>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const cluster = HistoryManager.getClusterName();

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="app-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchApp = async () => {
    const params: AppQuery = {
      rateInterval: `${String(duration)}s`,
      health: 'true',
    };
    if (!namespace || !app) {
      setError(`Could not fetch application: Empty namespace or app name`);
      kialiState.alertUtils!.add(
        `Could not fetch application: Empty namespace or app name`,
      );
      return;
    }

    kialiClient
      .getApp(namespace, app, params, cluster)
      .then((appResponse: App) => {
        const healthR = AppHealth.fromJson(namespace, app, appResponse.health, {
          rateInterval: duration,
          hasSidecar: appResponse.workloads.some(w => w.istioSidecar),
          hasAmbient: appResponse.workloads.some(w => w.istioAmbient),
        });
        setAppItem(appResponse);
        setHealth(healthR);
      })
      .catch((err: AxiosError<unknown, any>) => {
        setError(`Could not fetch application: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch application: ${getErrorString(err)}`,
        );
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchApp();
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
        {appItem && (
          <AppInfo app={appItem} duration={duration} health={health} />
        )}
      </>
    );
  };

  const inboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && app && (
          <IstioMetrics
            data-test="inbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={app}
            cluster={appItem?.cluster}
            objectType={MetricsObjectTypes.APP}
            direction="inbound"
          />
        )}
      </>
    );
  };

  const outboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && app && (
          <IstioMetrics
            data-test="outbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={app}
            cluster={appItem?.cluster}
            objectType={MetricsObjectTypes.APP}
            direction="outbound"
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
          onRefresh={() => fetchApp()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="App details"
            description={<div>No App found </div>}
          />
        )}
        <div style={{ marginTop: '20px' }}>
          <TabbedCard>
            <CardTab label="Overview">{overviewTab()}</CardTab>
            <CardTab label="Inbound Metrics">{inboundTab()}</CardTab>
            <CardTab label="Outbound Metrics">{outboundTab()}</CardTab>
          </TabbedCard>
        </div>
      </Content>
    </div>
  );
};
