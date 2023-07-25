import {
  ComputedServerConfig,
  DEGRADED,
  DurationInSeconds,
  FAILURE,
  HEALTHY,
  NamespaceInfo,
  NamespaceStatus,
  NOT_READY,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

import {
  AppHealth,
  Health,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  ServiceHealth,
  switchType,
  WorkloadHealth,
} from '../../helper';

const generateHealth = (
  serverConfig: ComputedServerConfig,
  type: OverviewType,
  namespace: NamespaceInfo,
  duration: DurationInSeconds,
): NamespaceAppHealth | NamespaceServiceHealth | NamespaceWorkloadHealth => {
  const ret:
    | NamespaceAppHealth
    | NamespaceServiceHealth
    | NamespaceWorkloadHealth = {};
  const typeFunc = switchType(type, AppHealth, ServiceHealth, WorkloadHealth);
  Object.keys(namespace.nsHealth!).forEach(k => {
    ret[k] = typeFunc.fromJson(
      serverConfig,
      namespace.name,
      k,
      namespace.nsHealth![k],
      {
        rateInterval: duration,
        hasSidecar: true,
      },
    );
  });
  return ret;
};

export const calculateHealth = (
  serverConfig: ComputedServerConfig,
  type: OverviewType,
  ns: NamespaceInfo,
  duration: DurationInSeconds,
): NamespaceInfo => {
  const nsInfo = ns;
  const healths = generateHealth(serverConfig, type, ns, duration);
  const nsStatus: NamespaceStatus = {
    inNotReady: [],
    inError: [],
    inWarning: [],
    inSuccess: [],
    notAvailable: [],
  };
  Object.keys(healths).forEach(item => {
    const health: Health = healths[item];
    const status = health.getGlobalStatus();
    if (status === FAILURE) {
      nsStatus.inError.push(item);
    } else if (status === DEGRADED) {
      nsStatus.inWarning.push(item);
    } else if (status === HEALTHY) {
      nsStatus.inSuccess.push(item);
    } else if (status === NOT_READY) {
      nsStatus.inNotReady.push(item);
    } else {
      nsStatus.notAvailable.push(item);
    }
  });
  nsInfo.status = nsStatus;
  return nsInfo;
};
