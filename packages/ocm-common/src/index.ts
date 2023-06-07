/***/
/**
 * Common functionalities for the Open Cluster Management plugin.
 *
 * @packageDocumentation
 */

export type ClusterStatus = {
  available: boolean;
  reason?: string;
};

export type ClusterBase = {
  name: string;
};

export type ClusterUpdate = {
  available?: boolean;
  version?: string;
  url?: string;
};

export type ClusterNodesStatus = {
  status: string;
  type: string;
};

export type ClusterDetails = {
  consoleUrl?: string;
  kubernetesVersion?: string;
  oauthUrl?: string;
  openshiftId?: string;
  openshiftVersion?: string;
  platform?: string;
  region?: string;
  allocatableResources?: {
    cpuCores?: number;
    memorySize?: string;
    numberOfPods?: number;
  };
  availableResources?: {
    cpuCores?: number;
    memorySize?: string;
    numberOfPods?: number;
  };
  update?: ClusterUpdate;
  status: ClusterStatus;
};

export type Cluster = ClusterBase & ClusterDetails;
export type ClusterOverview = ClusterBase & {
  status: ClusterStatus;
  update: ClusterUpdate;
  platform: string;
  openshiftVersion: string;
  nodes: Array<ClusterNodesStatus>;
};

export const ANNOTATION_CLUSTER_ID = 'janus-idp.io/ocm-cluster-id';
export const ANNOTATION_PROVIDER_ID = 'janus-idp.io/ocm-provider-id';
