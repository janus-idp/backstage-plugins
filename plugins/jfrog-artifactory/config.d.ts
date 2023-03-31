export interface Config {
  /** Configurations for the Artifactory plugin */
  jfrogArtifactory?: {
    /**
     * The base url of the Artifactory instance.
     * @visibility frontend
     */
    proxyPath?: string;
  };
}
