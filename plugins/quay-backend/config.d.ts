export interface Config {
    /** Configurations for the Quay plugin */
    quay: {
      /**
       * The base url of the Quay instance.
       * @visibility frontend
       */
      baseUrl: string;
      /**
       * The base url of the Quay instance.
       * @visibility frontend
       */
      token: string;
      /**
       * Token to access the Quay instance.
       * @visibility secret
       */
    };
  }