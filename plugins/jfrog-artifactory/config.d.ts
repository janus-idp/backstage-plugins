export interface Config {
  /** Configurations for the Jfrog Artifactory plugin */
  jfrogArtifactory?: {
    /**
     * The base url of the Jfrog Artifactory instance.
     * @visibility frontend
     */
    proxyPath?: string;
  };
}
