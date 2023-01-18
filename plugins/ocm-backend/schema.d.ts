export interface Config {
  ocm: {
    /**
     * Match cluster name where the Open Cluster Management operator is installed from the kubernetes plugin configuration
     * @visibility frontend
     */
    cluster?: string;
    hub?: {
      /**
       * Url of the hub cluster API endpoint
       * @visibility frontend
       */
      url: string;
      /**
       * Name of the cluster
       * @visibility frontend
       */
      name: string;
      /**
       * Service Account Token which is used for querying data from the hub
       * @visibility secret
       */
      serviceAccountToken?: string;
      /**
       * Skip TLS certificate verification presented by the API server, defaults to false
       * @visibility frontend
       */
      skipTLSVerify?: boolean;
      /**
       * Base64-encoded CA bundle in PEM format used for verifying the TLS cert presented by the API server
       * @visibility backend
       */
      caData?: string;
    };
  };
}
