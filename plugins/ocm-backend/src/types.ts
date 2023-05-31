import { KubernetesObject, V1PodCondition } from '@kubernetes/client-node';
import { TaskScheduleDefinition } from '@backstage/backend-tasks';

export type OcmConfig = {
  id: string;
  url: string;
  hubResourceName: string;
  serviceAccountToken?: string;
  skipTLSVerify?: boolean;
  caData?: string;
  owner: string;
  schedule?: TaskScheduleDefinition;
};

export interface ClusterClaim {
  name: string;
  value: string;
}

export interface ManagedCluster extends KubernetesObject {
  spec: {
    hubAcceptsClient: boolean;
    leaseDurationSeconds: number;
    managedClusterClientConfigs: {
      caBundle: string;
      url: string;
    }[];
  };
  status?: {
    allocatable: Record<string, string>;
    capacity: Record<string, string>;
    clusterClaims: ClusterClaim[];
    conditions: V1PodCondition[];
    version: {
      kubernetes: string;
    };
  };
}

interface OcpVersion {
  channels: string[];
  image: string;
  url: string;
  version: string;
}

export interface ManagedClusterInfo extends KubernetesObject {
  spec: {
    masterEndpoint: string;
  };
  status?: {
    nodeList?: {
      capacity: {
        cpu: string;
        memory: string;
        socket: string;
      };
      conditions: {
        status: string;
        type: string;
      }[];
      labels: Record<string, string>;
      name: string;
    }[];
    distributionInfo: {
      ocp: {
        availableUpdates?: string[];
        channel: string;
        desired: OcpVersion;
        desiredVersion: string;
        managedClusterConfig: {
          caBundle: string;
          url: string;
        };
        version: string;
        versionAvailableUpdates: OcpVersion[];
        versionHistory: {
          image: string;
          state: string;
          verified: boolean;
          version: string;
        }[];
      };
      type: string;
    };
    loggingEndpoint: {
      hostname: string;
      ip: string;
    };
    clusterID: string;
    kubeVendor: string;
    consoleURL: string;
    version: string;
    conditions: V1PodCondition[];
  };
}
