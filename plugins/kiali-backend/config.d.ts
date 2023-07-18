export interface Config {
  catalog?: {
    providers?: {
      kiali?: {
        /**
         * Url of the hub cluster API endpoint
         */
        url: string;
        /**
         * Strategy used to auth with Kiali
         * -  anonymous
         * -  token
         *
         * More info in https://kiali.io/docs/configuration/authentication/
         *
         */
        strategy: string;
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
      };
    };
  };
}
