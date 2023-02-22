import {
  CustomObjectsApi,
  KubeConfig,
  KubernetesListObject,
} from '@kubernetes/client-node';
import { Logger } from 'winston';
import http from 'http';
import { ManagedCluster, ManagedClusterInfo, OcmConfig } from '../types';

export const hubApiClient = (
  clusterConfig: OcmConfig,
  logger: Logger,
): CustomObjectsApi => {
  const kubeConfig = new KubeConfig();

  if (!clusterConfig.serviceAccountToken) {
    logger.info('Using default kubernetes config');
    kubeConfig.loadFromDefault();
    return kubeConfig.makeApiClient(CustomObjectsApi);
  }

  logger.info('Loading kubernetes config from config file');

  const user = {
    name: 'backstage',
    token: clusterConfig.serviceAccountToken,
  };

  const context = {
    name: clusterConfig.hubResourceName,
    user: user.name,
    cluster: clusterConfig.hubResourceName,
  };

  kubeConfig.loadFromOptions({
    clusters: [
      {
        server: clusterConfig.url,
        name: clusterConfig.hubResourceName,
        serviceAccountToken: clusterConfig.serviceAccountToken,
        skipTLSVerify: clusterConfig.skipTLSVerify,
        caData: clusterConfig.caData,
      },
    ],
    users: [user],
    contexts: [context],
    currentContext: context.name,
  });
  return kubeConfig.makeApiClient(CustomObjectsApi);
};

const kubeApiResponseHandler = <T extends Object>(
  call: Promise<{
    response: http.IncomingMessage;
    body: object;
  }>,
) => {
  return call
    .then(r => {
      return r.body as T;
    })
    .catch(r => {
      throw Object.assign(new Error(r.body.reason), {
        statusCode: r.body.code,
        name: r.body.reason,
        ...r.body,
      });
    });
};

export const getManagedCluster = (api: CustomObjectsApi, name: string) => {
  return kubeApiResponseHandler<ManagedCluster>(
    api.getClusterCustomObject(
      'cluster.open-cluster-management.io',
      'v1',
      'managedclusters',
      name,
    ),
  );
};

export const listManagedClusters = (api: CustomObjectsApi) => {
  return kubeApiResponseHandler<KubernetesListObject<ManagedCluster>>(
    api.listClusterCustomObject(
      'cluster.open-cluster-management.io',
      'v1',
      'managedclusters',
    ),
  );
};

export const getManagedClusterInfo = (api: CustomObjectsApi, name: string) => {
  return kubeApiResponseHandler<ManagedClusterInfo>(
    api.getNamespacedCustomObject(
      'internal.open-cluster-management.io',
      'v1beta1',
      name,
      'managedclusterinfos',
      name,
    ),
  );
};
