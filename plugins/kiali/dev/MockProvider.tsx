import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { Traffic } from '@material-ui/icons';

import { getEntityRoutes } from '../src/components/Router';
import { AppDetailsPage } from '../src/pages/AppDetails/AppDetailsPage';
import { AppListPage } from '../src/pages/AppList/AppListPage';
import { IstioConfigDetailsPage } from '../src/pages/IstioConfigDetails/IstioConfigDetailsPage';
import { IstioConfigListPage } from '../src/pages/IstioConfigList/IstioConfigListPage';
import { KialiNoPath } from '../src/pages/Kiali';
import { KialiHeader } from '../src/pages/Kiali/Header/KialiHeader';
import { OverviewPage } from '../src/pages/Overview/OverviewPage';
import { ServiceDetailsPage } from '../src/pages/ServiceDetails/ServiceDetailsPage';
import { ServiceListPage } from '../src/pages/ServiceList/ServiceListPage';
import TrafficGraphPage from '../src/pages/TrafficGraph/TrafficGraphPage';
import { WorkloadDetailsPage } from '../src/pages/WorkloadDetails/WorkloadDetailsPage';
import { WorkloadListPage } from '../src/pages/WorkloadList/WorkloadListPage';
import { KialiApi, kialiApiRef } from '../src/services/Api';
import { KialiProvider } from '../src/store/KialiProvider';
import { App, AppQuery } from '../src/types/App';
import { AppList, AppListQuery } from '../src/types/AppList';
import { AuthInfo } from '../src/types/Auth';
import { CertsInfo } from '../src/types/CertsInfo';
import { DurationInSeconds, TimeInSeconds } from '../src/types/Common';
import { DashboardModel } from '../src/types/Dashboards';
import { GrafanaInfo } from '../src/types/GrafanaInfo';
import { GraphDefinition, GraphElementsQuery } from '../src/types/Graph';
import {
  AppHealth,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  ServiceHealth,
  WorkloadHealth,
} from '../src/types/Health';
import { IstioConfigDetails } from '../src/types/IstioConfigDetails';
import { IstioConfigList } from '../src/types/IstioConfigList';
import {
  CanaryUpgradeStatus,
  OutboundTrafficPolicy,
  PodLogs,
  ValidationStatus,
} from '../src/types/IstioObjects';
import {
  ComponentStatus,
  IstiodResourceThresholds,
} from '../src/types/IstioStatus';
import { IstioMetricsMap } from '../src/types/Metrics';
import { IstioMetricsOptions } from '../src/types/MetricsOptions';
import { Namespace } from '../src/types/Namespace';
import { KialiCrippledFeatures, ServerConfig } from '../src/types/ServerConfig';
import { ServiceDetailsInfo } from '../src/types/ServiceInfo';
import { ServiceList, ServiceListQuery } from '../src/types/ServiceList';
import { StatusState } from '../src/types/StatusState';
import { TLSStatus } from '../src/types/TLSStatus';
import { Span, TracingQuery } from '../src/types/Tracing';
import {
  ClusterWorkloadsResponse,
  Workload,
  WorkloadQuery,
} from '../src/types/Workload';
import { filterNsByAnnotation } from '../src/utils/entityFilter';
import { kialiData } from './__fixtures__';
import { mockEntity } from './mockEntity';

export class MockKialiClient implements KialiApi {
  private entity?: Entity;

  constructor() {
    this.entity = undefined;
  }

  getGraphElements(_params: GraphElementsQuery): Promise<GraphDefinition> {
    return kialiData.graph;
  }

  setEntity(entity?: Entity): void {
    this.entity = entity;
  }

  async status(): Promise<StatusState> {
    return kialiData.status;
  }

  async getAuthInfo(): Promise<AuthInfo> {
    return kialiData.auth;
  }
  async getStatus(): Promise<StatusState> {
    return kialiData.status;
  }

  async getNamespaces(): Promise<Namespace[]> {
    return filterNsByAnnotation(
      kialiData.namespaces as Namespace[],
      this.entity,
    );
  }

  async getClustersWorkloads(
    _namespaces: string,
    _: AppListQuery,
    _cluster?: string,
  ): Promise<ClusterWorkloadsResponse> {
    return kialiData.clusters.kubernetes.workloads;
  }

  async getWorkload(
    namespace: string,
    name: string,
    _: WorkloadQuery,
    __?: string,
  ): Promise<Workload> {
    const parsedName = name.replace(/-/g, '');
    return kialiData.namespacesData[namespace].workloads[parsedName];
  }

  async getIstioConfig(
    namespace: string,
    _: string[],
    __: boolean,
    ___: string,
    ____: string,
    _____?: string,
  ): Promise<IstioConfigList> {
    return kialiData.namespacesData[namespace].istioConfigList;
  }

  async getServerConfig(): Promise<ServerConfig> {
    return kialiData.config;
  }

  async getNamespaceTls(
    namespace: string,
    cluster?: string,
  ): Promise<TLSStatus> {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return kialiData.namespacesData[namespace].tls;
  }

  async getMeshTls(cluster?: string): Promise<TLSStatus> {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return kialiData.meshTls;
  }

  async getOutboundTrafficPolicyMode(): Promise<OutboundTrafficPolicy> {
    return kialiData.outboundTrafficPolicy;
  }

  async getCanaryUpgradeStatus(): Promise<CanaryUpgradeStatus> {
    return kialiData.meshCanaryStatus;
  }

  async getIstiodResourceThresholds(): Promise<IstiodResourceThresholds> {
    return kialiData.meshIstioResourceThresholds;
  }

  async getConfigValidations(cluster?: string): Promise<ValidationStatus> {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return kialiData.istioValidations;
  }

  async getAllIstioConfigs(
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string,
  ): Promise<IstioConfigList> {
    const params: any = {};
    if (objects && objects.length > 0) {
      params.objects = objects.join(',');
    }
    if (validate) {
      params.validate = validate;
    }
    if (labelSelector) {
      params.labelSelector = labelSelector;
    }
    if (workloadSelector) {
      params.workloadSelector = workloadSelector;
    }
    if (cluster) {
      params.clusterName = cluster;
    }
    return kialiData.istioConfig;
  }

  async getNamespaceMetrics(
    namespace: string,
    params: IstioMetricsOptions,
  ): Promise<Readonly<IstioMetricsMap>> {
    return kialiData.namespacesData[namespace].metrics[params.direction][
      params.duration as number
    ];
  }

  async getIstioStatus(cluster?: string): Promise<ComponentStatus[]> {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return kialiData.istioStatus;
  }

  async getIstioCertsInfo(): Promise<CertsInfo[]> {
    return kialiData.istioCertsInfo;
  }
  isDevEnv(): boolean {
    return true;
  }

  async getPodLogs(
    _: string,
    __: string,
    container?: string,
    ___?: number,
    ____?: number,
    _duration?: DurationInSeconds,
    _isProxy?: boolean,
    _cluster?: string,
  ): Promise<PodLogs> {
    if (container === 'istio-proxy') {
      return kialiData.istioLogs;
    }
    return kialiData.logs;
  }

  setPodEnvoyProxyLogLevel = async (
    _namespace: string,
    _name: string,
    _level: string,
    _cluster?: string,
  ): Promise<void> => {
    return;
  };

  async getWorkloadSpans(
    _: string,
    __: string,
    ___: TracingQuery,
    ____?: string,
  ): Promise<Span[]> {
    return kialiData.spanLogs;
  }

  async getClustersServices(
    _namespaces: string,
    _: ServiceListQuery,
    __?: string,
  ): Promise<ServiceList> {
    return kialiData.clusters.kubernetes.services;
  }

  async getClustersAppHealth(
    namespaces: string,
    _: DurationInSeconds,
    __?: string,
    ___?: TimeInSeconds,
  ): Promise<Map<string, NamespaceAppHealth>> {
    const namespaceAppHealth =
      kialiData.clusters.kubernetes.appsHealth.namespaceAppHealth;

    const ret = new Map<string, NamespaceAppHealth>();
    if (namespaceAppHealth) {
      Object.keys(namespaceAppHealth).forEach(ns => {
        if (!ret.get(ns)) {
          ret.set(ns, {});
        }
        Object.keys(namespaceAppHealth[ns]).forEach(k => {
          // @ts-ignore
          if (namespaceAppHealth[ns][k]) {
            // @ts-ignore
            const conv = namespaceAppHealth[ns][k];
            // @ts-ignore
            const ah = AppHealth.fromJson(namespaces, k, conv, {
              rateInterval: 60,
              hasSidecar: true,
              hasAmbient: false,
            });
            const nsAppHealth = ret.get(ns) || {};
            nsAppHealth[k] = ah;
            ret.set(ns, nsAppHealth);
          }
        });
      });
    }
    return ret;
  }

  async getClustersServiceHealth(
    namespaces: string,
    _: DurationInSeconds,
    __?: string,
    ___?: TimeInSeconds,
  ): Promise<Map<string, NamespaceServiceHealth>> {
    const namespaceServiceHealth =
      kialiData.clusters.kubernetes.servicesHealth.namespaceServiceHealth;
    const ret = new Map<string, NamespaceServiceHealth>();
    if (namespaceServiceHealth) {
      Object.keys(namespaceServiceHealth).forEach(ns => {
        if (!ret.get(ns)) {
          ret.set(ns, {});
        }
        Object.keys(namespaceServiceHealth[ns]).forEach(k => {
          // @ts-ignore
          if (namespaceServiceHealth[ns][k]) {
            // @ts-ignore
            const conv = namespaceServiceHealth[ns][k];
            // @ts-ignore
            const sh = ServiceHealth.fromJson(namespaces, k, conv, {
              rateInterval: 60,
              hasSidecar: true,
              hasAmbient: false,
            });
            // @ts-ignore
            const nsSvcHealth = ret.get(ns) || {};
            nsSvcHealth[k] = sh;
            ret.set(ns, nsSvcHealth);
          }
        });
      });
    }
    return ret;
  }

  async getClustersWorkloadHealth(
    namespaces: string,
    _: DurationInSeconds,
    __?: string,
    ___?: TimeInSeconds,
  ): Promise<Map<string, NamespaceWorkloadHealth>> {
    const namespaceWorkloadHealth =
      kialiData.clusters.kubernetes.workloadsHealth.namespaceWorkloadHealth;
    const ret = new Map<string, NamespaceWorkloadHealth>();
    if (namespaceWorkloadHealth) {
      Object.keys(namespaceWorkloadHealth).forEach(ns => {
        if (!ret.get(ns)) {
          ret.set(ns, {});
        }
        Object.keys(namespaceWorkloadHealth[ns]).forEach(k => {
          // @ts-ignore
          if (namespaceWorkloadHealth[ns][k]) {
            // @ts-ignore
            const conv = namespaceWorkloadHealth[ns][k];
            // @ts-ignore
            const wh = WorkloadHealth.fromJson(namespaces, k, conv, {
              rateInterval: 60,
              hasSidecar: true,
              hasAmbient: false,
            });
            const nsWkHealth = ret.get(ns) || {};
            nsWkHealth[k] = wh;
            ret.set(ns, nsWkHealth);
          }
        });
      });
    }
    return ret;
  }

  async getIstioConfigDetail(
    namespace: string,
    objectType: string,
    object: string,
    _validate: boolean,
    _cluster?: string,
  ): Promise<IstioConfigDetails> {
    return kialiData.namespacesData[namespace].istioConfigDetails[objectType][
      object
    ];
  }

  async getServiceDetail(
    namespace: string,
    service: string,
    _validate: boolean,
    _cluster?: string,
    rateInterval?: DurationInSeconds,
  ): Promise<ServiceDetailsInfo> {
    const parsedName = service.replace(/-/g, '');
    const info: ServiceDetailsInfo =
      kialiData.namespacesData[namespace].services[parsedName];

    if (info.health) {
      // Default rate interval in backend = 600s
      info.health = ServiceHealth.fromJson(namespace, service, info.health, {
        rateInterval: rateInterval ?? 600,
        hasSidecar: info.istioSidecar,
        hasAmbient: info.istioAmbient,
      });
    }
    return info;
  }

  getClustersApps = async (
    _namespaces: string,
    _: AppListQuery,
    __?: string,
  ): Promise<AppList> => {
    return kialiData.clusters.kubernetes.apps;
  };

  getApp = async (
    namespace: string,
    app: string,
    _params: AppQuery,
    _cluster?: string,
  ): Promise<App> => {
    const parsedName = app.replace(/-/g, '');
    return kialiData.namespacesData[namespace].apps[parsedName];
  };

  getCrippledFeatures = async (): Promise<KialiCrippledFeatures> => {
    return kialiData.crippledFeatures;
  };

  getWorkloadDashboard = async (
    namespace: string,
    _workload: string,
    _params: IstioMetricsOptions,
    _cluster?: string,
  ): Promise<DashboardModel> => {
    return kialiData.namespacesData[namespace].dashboard;
  };

  getServiceDashboard = async (
    namespace: string,
    _service: string,
    _params: IstioMetricsOptions,
    _cluster?: string,
  ): Promise<DashboardModel> => {
    return kialiData.namespacesData[namespace].dashboard;
  };

  getAppDashboard = async (
    namespace: string,
    _app: string,
    _params: IstioMetricsOptions,
    _cluster?: string,
  ): Promise<DashboardModel> => {
    return kialiData.namespacesData[namespace].dashboard;
  };

  getGrafanaInfo = async (): Promise<GrafanaInfo> => {
    return kialiData.grafanaInfo;
  };

  getAppSpans = async (
    namespace: string,
    _app: string,
    _params: TracingQuery,
    _cluster?: string,
  ): Promise<Span[]> => {
    return kialiData.namespacesData[namespace].spans;
  };

  getServiceSpans = async (
    namespace: string,
    _service: string,
    _params: TracingQuery,
    _cluster?: string,
  ): Promise<Span[]> => {
    return kialiData.namespacesData[namespace].spans;
  };
}

const getSelected = (route: number) => {
  const pathname = window.location.pathname.split('/');
  const paths = ['workloads', 'applications', 'services', 'istio', 'graph'];
  if (pathname && paths.includes(pathname[2])) {
    switch (pathname[2]) {
      case 'workloads':
        return <WorkloadDetailsPage />;
      case 'services':
        return <ServiceDetailsPage />;
      case 'applications':
        return <AppDetailsPage />;
      case 'istio':
        return <IstioConfigDetailsPage />;
      case 'graph':
        return <TrafficGraphPage />;
      default:
        return <OverviewPage />;
    }
  }
  switch (route) {
    case 0:
      return <OverviewPage />;
    case 1:
      return <WorkloadListPage />;
    case 2:
      return <ServiceListPage />;
    case 3:
      return <AppListPage />;
    case 4:
      return <IstioConfigListPage />;
    case 5:
      return <TrafficGraphPage />;
    default:
      return <KialiNoPath />;
  }
};

interface Props {
  children?: React.ReactNode;
  entity?: Entity;
  isEntity?: boolean;
}

export const MockProvider = (props: Props) => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    { label: 'Overview', route: `/kiali#overview` },
    { label: 'Workloads', route: `/kiali#workloads` },
    { label: 'Services', route: `/kiali#services` },
    { label: 'Applications', route: `/kiali#applications` },
    { label: 'Istio Config', route: `/kiali#istio` },
    { label: 'Traffic Graph', route: `/kiali#graph` },
  ];

  const content = (
    <KialiProvider entity={props.entity || mockEntity}>
      <Page themeId="tool">
        {!props.isEntity && (
          <>
            <KialiHeader />
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

            {getSelected(selectedTab)}
          </>
        )}
        {props.isEntity && <Content>{getEntityRoutes()}</Content>}
      </Page>
    </KialiProvider>
  );

  const viewIfEntity = props.isEntity && (
    <EntityProvider entity={mockEntity}>{content}</EntityProvider>
  );

  return (
    <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
      {viewIfEntity || content}
    </TestApiProvider>
  );
};
