import React from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { kialiPlugin } from '../src';
import { KialiNoPath } from '../src/pages/Kiali';
import { KialiHeader } from '../src/pages/Kiali/Header/KialiHeader';
import { KialiHeaderEntity } from '../src/pages/Kiali/Header/KialiHeaderEntity';
import { KialiEntity } from '../src/pages/Kiali/KialiEntity';
import { KialiNoAnnotation } from '../src/pages/Kiali/KialiNoAnnotation';
import { KialiNoResources } from '../src/pages/Kiali/KialiNoResources';
import { OverviewPage } from '../src/pages/Overview/OverviewPage';
import { WorkloadListPage } from '../src/pages/WorkloadList/WorkloadListPage';
import { KialiApi, kialiApiRef } from '../src/services/Api';
import { KialiProvider } from '../src/store/KialiProvider';
import { AuthInfo } from '../src/types/Auth';
import { CertsInfo } from '../src/types/CertsInfo';
import { DurationInSeconds, TimeInSeconds } from '../src/types/Common';
import {
  AppHealth,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  ServiceHealth,
  WorkloadHealth,
} from '../src/types/Health';
import { IstioConfigsMap } from '../src/types/IstioConfigList';
import {
  CanaryUpgradeStatus,
  OutboundTrafficPolicy,
  ValidationStatus,
} from '../src/types/IstioObjects';
import {
  ComponentStatus,
  IstiodResourceThresholds,
} from '../src/types/IstioStatus';
import { IstioMetricsMap } from '../src/types/Metrics';
import { IstioMetricsOptions } from '../src/types/MetricsOptions';
import { Namespace } from '../src/types/Namespace';
import { ServerConfig } from '../src/types/ServerConfig';
import { StatusState } from '../src/types/StatusState';
import { TLSStatus } from '../src/types/TLSStatus';
import {
  WorkloadListItem,
  WorkloadNamespaceResponse,
  WorkloadOverview,
} from '../src/types/Workload';
import { filterNsByAnnotation } from '../src/utils/entityFilter';
import { kialiData } from './__fixtures__';
import { mockEntity, mockEntityAnnotationNoNamespace } from './mockEntity';
import { GraphPage } from '../src/pages/Graph/GraphPage';
import { GraphDefinition, GraphElementsQuery } from '../src/types/Graph';

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

  /** Graph **/

  async getGraphElements(params: GraphElementsQuery): Promise<GraphDefinition> {
    return kialiData.graph.graphData[params.namespaces as string][60]
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
}

interface Props {
  children?: React.ReactNode;
  entity?: Entity;
  isEntity?: boolean;
}

export const TabsMock = () => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    { label: 'Overview', route: 'overview' },
    { label: 'Graph', route: 'graph' },
    { label: 'Workloads', route: 'workloads' },
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

const RoutesList = () => (
  <Routes>
    <Route path="/" element={<OverviewPage />} />
    <Route path="/overview" element={<OverviewPage />} />
    <Route path="/graph" element={<GraphPage />} />
    <Route path="/workloads" element={<WorkloadListPage />} />
    <Route path="/kiali" element={<KialiEntity />} />
    <Route path="*" element={<KialiNoPath />} />
  </Routes>
);

const MockProvider = (props: Props) => {
  const content = (
    <KialiProvider entity={props.entity || mockEntity}>
      <BrowserRouter>
        <Page themeId="tool">
          {!props.isEntity && (
            <>
              <KialiHeader />
              <TabsMock />
              <RoutesList />
            </>
          )}
          {props.isEntity && (
            <Content>
              <KialiHeaderEntity />
              <RoutesList />
            </Content>
          )}
        </Page>
      </BrowserRouter>
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

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: <MockProvider />,
    title: 'KialiPage',
    path: '/overview',
  })
  .addPage({
    element: <MockProvider isEntity />,
    title: 'Entity',
    path: '/kiali',
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
  .render();
