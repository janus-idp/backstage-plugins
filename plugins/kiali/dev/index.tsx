import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { KialiPage, kialiPlugin } from '../src/plugin';
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
import { filterNsByAnnotation } from '../src/utils/entityFilter';
import { kialiData } from './__fixtures__';
import { mockEntity } from './mockEntity';

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
// @ts-expect-error
const MockProvider = ({ children }) => (
  <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
    <EntityProvider entity={mockEntity}>
      <KialiProvider>{children}</KialiProvider>
    </EntityProvider>
  </TestApiProvider>
);

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: (
      <MockProvider>
        <KialiPage />
      </MockProvider>
    ),
    title: 'Overview Page',
    path: '/kiali/overview',
  })
  .render();
