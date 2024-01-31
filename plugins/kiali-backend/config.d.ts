export interface Config {
  catalog?: {
    providers?: {
      kiali?: {
        /**
         * Url of the hub cluster API endpoint
         */
        url: string;
        /**
         * Service Account Token which is used for querying data from Kiali
         * @visibility secret
         */
        serviceAccountToken?: string;
        /**
         * Skip TLS certificate verification presented by the API server, defaults to false
         */
        skipTLSVerify?: boolean;
        /**
         * Base64-encoded certificate authority bundle in PEM format.
         * @visibility secret
         */
        caData?: string;
        /**
         * Filesystem path (on the host where the Backstage process is running) to a certificate authority bundle in PEM format
         * @visibility secret
         */
        caFile?: string;
        /**
         * Time in seconds that session is enabled, defaults to 1 minute.
         */
        sessionTime?: number;
      };
    };
  };
}
