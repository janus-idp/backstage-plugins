export interface Config {
  /** Configurations for the Quay plugin */
  quay?: {
    /**
     * The base url of the Quay instance.
     * @visibility frontend
     */
    proxyPath?: string;
  };
}
