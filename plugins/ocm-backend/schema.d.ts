export interface Config {
  ocm: {
    cluster?: {
      /**
       * Match cluster name where the Open Cluster Management operator is installed from the kubernetes plugin configuration
       * @visibility frontend
       */
      name: string;
    };
    hub?: {
      /**
       * Url of the hub cluster API endpoint, applies if name is not defined
       * @visibility frontend
       */
      url: string;
      /**
       * Name of the cluster endpoint
       * @visibility frontend
       */
      name: string;
      /**
       * Service Account Token for the SA which is used for querying data from the hub
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
