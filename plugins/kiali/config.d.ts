export interface Config {
  /** Configurations for the Kiali plugin */
  kiali?: {
    /**
     * The token secret for the Kiali instance.
     * @visibility frontend
     */
    token?: string;
  };
}
