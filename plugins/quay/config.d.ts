export interface Config {
  /** Configurations for the Quay plugin */
  quay?: {
    /**
     * The proxy path for the Quay instance.
     * @visibility frontend
     */
    proxyPath?: string;
    /**
     * The UI url of the Quay instance.
     * @visibility frontend
     */
    uiUrl?: string;
  };
}
