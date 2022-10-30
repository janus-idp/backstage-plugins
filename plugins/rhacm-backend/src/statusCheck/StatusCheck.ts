import { Config } from "@backstage/config";
import { ClusterDetails } from "@internal/backstage-plugin-rhacm-common";
import { CustomObjectsApi } from "@kubernetes/client-node"
import { Logger } from 'winston';
import { getCustomObjectsApi } from "./kubernetesApi";

export class StatusCheck {
  readonly ACM_CLUSTER_CONFIG = 'clusterStatus.acmCluster';

  acmCluster: string;
  logger: Logger;
  config: Config;
  api: CustomObjectsApi;


  constructor(config: Config, logger: Logger) {
    this.logger = logger;
    this.config = config;
    this.acmCluster = this.config.getString(this.ACM_CLUSTER_CONFIG);
    this.api = getCustomObjectsApi(this.getAcmClusterFromConfig(), this.logger);
  }

  public getAllClustersStatus = (): Promise<any> => (
    // Empty string means get all clusters
    this.getManagedClusterViaApi('')
  )

  public getClusterStatus = (clusterName: string): Promise<any> => {
    this.checkClusterNames(clusterName);

    let fixedClusterName = clusterName;
    if (clusterName === this.acmCluster) {
      fixedClusterName = 'local-cluster';
    }

    return this.getManagedClusterViaApi(fixedClusterName);
  }

  public parseStatusCheck = (managedCluster: any): ClusterDetails => {
    const clusterStatus: any = managedCluster.status
    const available = clusterStatus.conditions.find(
      (value: any) => (value.type === 'ManagedClusterConditionAvailable')
    ).status.toLowerCase() === 'true' ? true : false;

    const defaultStatus: ClusterDetails = {
      name: managedCluster.metadata.name,
      status: {
        available: available,
        reason: 'Cluster is up',
      }
    }

    if (defaultStatus.name === 'local-cluster') {
      defaultStatus.name = this.config.getString(this.ACM_CLUSTER_CONFIG)
    }

    if (!available) {
      defaultStatus.status.reason = 'Cluster is down';
      return defaultStatus;
    }

    const clusterClaims = clusterStatus.clusterClaims;
    const allocatable = clusterStatus.allocatable;
    const capacity = clusterStatus.capacity;
    const parsedClusterInfo = {
      consoleUrl: this.getClaim(clusterClaims, 'consoleurl.cluster.open-cluster-management.io',),
      kubernetesVersion: this.getClaim(clusterClaims, 'kubeversion.open-cluster-management.io'),
      oauthUrl: this.getClaim(clusterClaims, 'oauthredirecturis.openshift.io'),
      openshiftId: this.getClaim(clusterClaims, 'id.openshift.io'),
      openshiftVersion: this.getClaim(clusterClaims, 'version.openshift.io'),
      platform: this.getClaim(clusterClaims, 'platform.open-cluster-management.io'),
      region: this.getClaim(clusterClaims, 'region.open-cluster-management.io'),
      allocatableResources: {
        cpuCores: this.convertToCpus(allocatable.cpu),
        memorySize: allocatable.memory,
        numberOfPods: parseInt(allocatable.pods, 10),
      },
      availableResources: {
        cpuCores: this.convertToCpus(capacity.cpu),
        memorySize: capacity.memory,
        numberOfPods: parseInt(capacity.pods, 10),
      }
    }

    return {
      ...defaultStatus,
      ...parsedClusterInfo,
    }
  }

  private convertToCpus = (cpus: string): number => {
    if (cpus.slice(-1) === 'm') {
      return parseInt(cpus.slice(0, cpus.length - 1), 10) / 1000
    }
    return parseInt(cpus, 10)
  }

  private getManagedClusterViaApi = (clusterName: string): Promise<any> => (
    this.api.getClusterCustomObject(
      'cluster.open-cluster-management.io',
      'v1',
      'managedclusters',
      clusterName,
    ).catch(r => {
      this.logger.error(JSON.stringify(r.body))
    })
  )

  private getClaim = (clusterClaims: any[], claimName: string): string => (
    clusterClaims.find((value: any) => value.name === claimName)?.value
  )

  private getAcmClusterFromConfig = (): Config => {
    const clusters = this.getClustersFromConfig();

    const filteredClusters = clusters.filter((value) => (
      value.getString('name') === this.acmCluster
    ));
    if (filteredClusters.length !== 1) {
      this.logger.error(`found number of ACM clusters (${filteredClusters.length}) other than 1`);
      throw new Error();
    }
    return filteredClusters[0];
  }

  private checkClusterNames = (clusterName: string) => {
    const clusters = this.getClustersFromConfig();
    if (!clusters.some((value) => (
      value.getString('name') === clusterName
    ))) {
      throw new Error(`${clusterName} cluster is not contained in the config file`);
    }
  }

  private getClustersFromConfig = (): Config[] => {
    const clusters = this.config.getConfigArray('kubernetes.clusterLocatorMethods')
      .map((value) => {
        const configType = value.getString('type')
        if (configType !== 'config') {
          this.logger.warn(`${configType} is not a supported configuration type`);
          return [];
        }
        return value.getConfigArray('clusters');
      }).flat(1);
    return clusters;
  }

  // TODO: This doesn't work if the clusters have more then one ACM cluster

}
