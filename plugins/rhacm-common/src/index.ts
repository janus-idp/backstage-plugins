/***/
/**
 * Common functionalities for the rhacm plugin.
 *
 * @packageDocumentation
 */

export type ClusterDetails = {
  consoleUrl?: string,
  kubernetesVersion?: string,
  name?: string,
  oauthUrl?: string
  openshiftId?: string
  openshiftVersion?: string,
  platform?: string,
  region?: string,
  allocatableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
  availableResources?: {
    cpuCores: number,
    memorySize: string,
    numberOfPods: number,
  }
  status: {
    available: boolean,
    reason: string,
  }
}
