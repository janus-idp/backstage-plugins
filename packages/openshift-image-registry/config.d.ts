export interface Config {
  /** Configurations for the Openshift Image Registry plugin */
  openshiftImageRegistry?: {
    /**
     * The base url of the Openshift instance.
     * @visibility frontend
     */
    proxyPath?: string;
  };
}
