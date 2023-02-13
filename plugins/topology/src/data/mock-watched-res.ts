import { TopologyResourcesObject } from '../components/Topology/types/topology-types';
import {
  WatchedResourceType,
  WatchK8sResults,
} from '../components/Topology/types/types';
import {
  mockDeploymentData,
  mockDeploymentData2,
  mockPodData,
  mockPodData2,
  mockPodData3,
  mockReplicasetData,
  mockReplicasetData2,
} from './mock-deployment';

export const mockResources: WatchK8sResults<TopologyResourcesObject> = {
  deployments: {
    data: [mockDeploymentData, mockDeploymentData2],
    loaded: true,
    loadError: '',
  },
  pods: {
    data: [mockPodData, mockPodData2, mockPodData3],
    loaded: true,
    loadError: '',
  },
  replicasets: {
    loaded: true,
    loadError: '',
    data: [mockReplicasetData, mockReplicasetData2],
  },
};

export const mockWatchedRes = (): WatchedResourceType => {
  const namespace = 'sample-app';
  return {
    deployments: {
      isList: true,
      kind: 'Deployment',
      namespace,
      optional: true,
    },
    pods: {
      isList: true,
      kind: 'Pod',
      namespace,
      optional: true,
    },
    services: {
      isList: true,
      kind: 'Service',
      namespace,
      optional: true,
    },
  };
};
