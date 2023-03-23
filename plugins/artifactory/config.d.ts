export interface Config {
  /** Configurations for the Artifactory plugin */
  artifactory?: {
    /**
     * The base url of the Artifactory instance.
     * @visibility frontend
     */
    proxyPath?: string;
  };
}
