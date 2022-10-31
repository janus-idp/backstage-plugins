import { CONSOLE_CLAIM } from "../constants"
import { ClusterDetails } from "@internal/backstage-plugin-rhacm-common"

const convertCpus = (cpus: string): number => {
  if (cpus.slice(-1) === 'm') {
    return parseInt(cpus.slice(0, cpus.length - 1), 10) / 1000
  }
  return parseInt(cpus, 10)
}

export const getClaim = (cluster: any, claimName: string): string => (
  cluster.status.clusterClaims.find((value: any) => value.name === claimName)?.value
)

export const parseManagedCluster = (cluster: any): ClusterDetails => {
  const available = cluster.status.conditions.find(
    (value: any) => (value.type === 'ManagedClusterConditionAvailable')
  );

  const status: ClusterDetails = {
    name: cluster.metadata.name,
    status: {
      available: available.status.toLowerCase() === 'true',
      reason: available.message,
    }
  }

  const allocatable = cluster.status.allocatable;
  const capacity = cluster.status.capacity;
  const parsedClusterInfo = {
    consoleUrl: getClaim(cluster, CONSOLE_CLAIM),
    kubernetesVersion: getClaim(cluster, 'kubeversion.open-cluster-management.io'),
    oauthUrl: getClaim(cluster, 'oauthredirecturis.openshift.io'),
    openshiftId: cluster.metadata?.labels?.clusterID || getClaim(cluster, 'id.openshift.io'),
    openshiftVersion: cluster.metadata?.labels?.openshiftVersion || getClaim(cluster, 'version.openshift.io'),
    platform: getClaim(cluster, 'platform.open-cluster-management.io'),
    region: getClaim(cluster, 'region.open-cluster-management.io'),
    allocatableResources: {
      cpuCores: convertCpus(allocatable.cpu),
      memorySize: allocatable.memory,
      numberOfPods: parseInt(allocatable.pods, 10),
    },
    availableResources: {
      cpuCores: convertCpus(capacity.cpu),
      memorySize: capacity.memory,
      numberOfPods: parseInt(capacity.pods, 10),
    }
  }

  return {
    ...status,
    ...parsedClusterInfo,
  }
}
