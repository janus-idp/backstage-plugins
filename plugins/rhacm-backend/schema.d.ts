export interface Config {
  rhacm: {
    /**
     * Name of the cluster where the ACM(Advanced Cluster Management) operator is installed
     * @visiblity frontend
     */
    hub: string;
  };
}
