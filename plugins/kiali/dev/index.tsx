import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import {
  Content,
  HeaderTabs,
  InfoCard,
  Page,
} from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { Grid } from '@material-ui/core';

import { EntityKialiResourcesCard, kialiPlugin } from '../src';
import { getEntityRoutes, getRoutes } from '../src/components/Router';
import { KialiHeader } from '../src/pages/Kiali/Header/KialiHeader';
import { KialiHelper } from '../src/pages/Kiali/KialiHelper';
import { KialiNoAnnotation } from '../src/pages/Kiali/KialiNoAnnotation';
import { KialiNoResources } from '../src/pages/Kiali/KialiNoResources';
import { pluginName } from '../src/plugin';
import { KialiApi, kialiApiRef } from '../src/services/Api';
import {
  KialiChecker,
  KialiProvider,
  ValidationCategory,
} from '../src/store/KialiProvider';
import { App, AppQuery } from '../src/types/App';
import { AppList, AppListQuery } from '../src/types/AppList';
import { AuthInfo } from '../src/types/Auth';
import { CertsInfo } from '../src/types/CertsInfo';
import { DurationInSeconds, TimeInSeconds } from '../src/types/Common';
import { DashboardModel } from '../src/types/Dashboards';
import { GrafanaInfo } from '../src/types/GrafanaInfo';
import {
  AppHealth,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  ServiceHealth,
  WorkloadHealth,
} from '../src/types/Health';
import { IstioConfigDetails } from '../src/types/IstioConfigDetails';
import { IstioConfigList, IstioConfigsMap } from '../src/types/IstioConfigList';
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
  Workload,
  WorkloadListItem,
  WorkloadNamespaceResponse,
  WorkloadOverview,
  WorkloadQuery,
} from '../src/types/Workload';
import { filterNsByAnnotation } from '../src/utils/entityFilter';
import { kialiData } from './__fixtures__';
import { mockEntity, mockEntityAnnotationNoNamespace } from './mockEntity';

class MockKialiClient implements KialiApi {
  private entity?: Entity;

  constructor() {
    this.entity = undefined;
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

  async getWorkloads(
    namespace: string,
    duration: number,
  ): Promise<WorkloadListItem[]> {
    const nsl = kialiData.workloads as WorkloadNamespaceResponse[];
    // @ts-ignore
    return nsl[namespace].workloads.map(
      (w: WorkloadOverview): WorkloadListItem => {
        return {
          name: w.name,
          namespace: namespace,
          cluster: w.cluster,
          type: w.type,
          istioSidecar: w.istioSidecar,
          istioAmbient: w.istioAmbient,
          additionalDetailSample: undefined,
          appLabel: w.appLabel,
          versionLabel: w.versionLabel,
          labels: w.labels,
          istioReferences: w.istioReferences,
          notCoveredAuthPolicy: w.notCoveredAuthPolicy,
          health: WorkloadHealth.fromJson(namespace, w.name, w.health, {
            rateInterval: duration,
            hasSidecar: w.istioSidecar,
            hasAmbient: w.istioAmbient,
          }),
        };
      },
    );
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

  async getNamespaceAppHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceAppHealth> {
    const ret: NamespaceAppHealth = {};
    const params: any = {
      type: 'app',
      rateInterval: `${String(duration)}s`,
      queryTime: String(queryTime),
      clusterName: cluster,
    };
    const data = kialiData.namespacesData[namespace].health[params.type];
    Object.keys(data).forEach(k => {
      ret[k] = AppHealth.fromJson(namespace, k, data[k], {
        rateInterval: duration,
        hasSidecar: true,
        hasAmbient: false,
      });
    });
    return ret;
  }

  async getNamespaceServiceHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceServiceHealth> {
    const ret: NamespaceServiceHealth = {};
    const params: any = {
      type: 'service',
      rateInterval: `${String(duration)}s`,
      queryTime: String(queryTime),
      clusterName: cluster,
    };
    const data = kialiData.namespacesData[namespace].health[params.type];
    Object.keys(data).forEach(k => {
      ret[k] = ServiceHealth.fromJson(namespace, k, data[k], {
        rateInterval: duration,
        hasSidecar: true,
        hasAmbient: false,
      });
    });
    return ret;
  }

  async getNamespaceWorkloadHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceWorkloadHealth> {
    const ret: NamespaceWorkloadHealth = {};
    const params: any = {
      type: 'workload',
      rateInterval: `${String(duration)}s`,
      queryTime: String(queryTime),
      clusterName: cluster,
    };
    const data = kialiData.namespacesData[namespace].health[params.type];
    Object.keys(data).forEach(k => {
      ret[k] = WorkloadHealth.fromJson(namespace, k, data[k], {
        rateInterval: duration,
        hasSidecar: true,
        hasAmbient: false,
      });
    });
    return ret;
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
    namespaces: string[],
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string,
  ): Promise<IstioConfigsMap> {
    const params: any =
      namespaces && namespaces.length > 0
        ? { namespaces: namespaces.join(',') }
        : {};
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

  async getServices(
    namespace: string,
    _?: ServiceListQuery,
  ): Promise<ServiceList> {
    return kialiData.services[namespace];
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

  getApps = async (
    namespace: string,
    _params: AppListQuery,
  ): Promise<AppList> => {
    return kialiData.apps[namespace];
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

interface Props {
  children?: React.ReactNode;
  entity?: Entity;
  isEntity?: boolean;
}

export const TabsMock = () => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    { label: 'Overview', route: `${pluginName}/overview` },
    { label: 'Workloads', route: `${pluginName}/workloads` },
    { label: 'Services', route: `${pluginName}/services` },
    { label: 'Applications', route: `${pluginName}/applications` },
    { label: 'Istio Config', route: `${pluginName}/istio` },
  ];
  const navigate = useNavigate();
  return (
    <HeaderTabs
      selectedIndex={selectedTab}
      onChange={(index: number) => {
        navigate(tabs[index].route);
        setSelectedTab(index);
      }}
      tabs={tabs.map(({ label }, index) => ({
        id: index.toString(),
        label,
      }))}
    />
  );
};

const MockProvider = (props: Props) => {
  const content = (
    <KialiProvider entity={props.entity || mockEntity}>
      <Page themeId="tool">
        {!props.isEntity && (
          <>
            <KialiHeader />
            <TabsMock />
            {getRoutes(true)}
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

const MockEntityCard = () => {
  const content = (
    <EntityProvider entity={mockEntity}>
      <div style={{ padding: '20px' }}>
        <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item md={8} xs={12}>
              <EntityKialiResourcesCard />
            </Grid>
          </Grid>
        </TestApiProvider>
      </div>
    </EntityProvider>
  );

  return (
    <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
      {content}
    </TestApiProvider>
  );
};

const MockKialiError = () => {
  const errorsTypes: KialiChecker[] = [
    {
      verify: false,
      title: 'Error reaching Kiali',
      message: ' Error status code 502',
      category: ValidationCategory.networking,
      helper: 'Check if http://kialiendpoint works',
    },
    {
      verify: false,
      title: 'Authentication failed. Missing Configuration',
      message: `Attribute 'serviceAccountToken' is not in the backstage configuration`,
      category: ValidationCategory.configuration,
      helper: 'Check if http://kialiendpoint works',
      missingAttributes: ['serviceAccountToken'],
    },
    {
      verify: false,
      title: 'Authentication failed. Not supported',
      message: `Strategy oauth2 is not supported in Kiali backstage plugin yet`,
      category: ValidationCategory.configuration,
    },
    {
      verify: false,
      title: 'Authentication failed',
      message: `We can't authenticate`,
      category: ValidationCategory.authentication,
    },
    {
      verify: false,
      title: 'Unkown error ',
      message: `Internal error`,
      category: ValidationCategory.unknown,
    },
    {
      verify: false,
      title: 'kiali version not supported',
      message: `Kiali version supported is v1.74, we found version v1.80`,
      category: ValidationCategory.versionSupported,
    },
    {
      verify: true,
      title: 'True verification, we not expect something',
      category: ValidationCategory.unknown,
    },
  ];

  return (
    <Page themeId="tool">
      <Content data-test="Kiali Errors">
        <Grid container direction="column">
          {errorsTypes.map(error => (
            <Grid item>
              <InfoCard
                title={`Error type : ${error.category} -- ${error.title}`}
              >
                <KialiHelper check={error} />
              </InfoCard>
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: <MockProvider />,
    title: 'KialiPage',
    path: `/${pluginName}/overview`,
  })
  .addPage({
    element: <MockKialiError />,
    title: 'Kiali error',
    path: `/kiali-error`,
  })
  .addPage({
    element: <KialiNoResources entity={mockEntityAnnotationNoNamespace} />,
    title: 'No resource',
    path: '/no-resource',
  })
  .addPage({
    element: <KialiNoAnnotation />,
    title: 'No Annotation',
    path: '/no-annotation',
  })
  .addPage({
    element: <MockEntityCard />,
    title: 'Resources card',
    path: '/kiali-entity-card',
  })
  .render();
