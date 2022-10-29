export interface Config {
  clusterStatus: {
    /**
     * Name of the cluster where the ACM(Advanced Cluster Management) operator is installed
     * @visiblity frontend
     */
    acmCluster: string;
  }
}
