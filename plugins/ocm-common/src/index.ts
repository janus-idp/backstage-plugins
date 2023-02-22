/***/
/**
 * Common functionalities for the Open Cluster Management plugin.
 *
 * @packageDocumentation
 */

export type ClusterDetails = {
  consoleUrl?: string;
  kubernetesVersion?: string;
  name?: string;
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
  update?: {
    available?: boolean;
    version?: string;
    url?: string;
  };
  status: {
    available: boolean;
    reason: string;
  };
};

export const ANNOTATION_CLUSTER_ID = 'janus-idp.io/ocm-cluster-id';
