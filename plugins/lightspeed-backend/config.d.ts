export interface Config {
  /**
   * Configuration required for using lightspeed
   * @visibility frontend
   */
  lightspeed: {
    servers: Array<{
      /**
       * The id of the server.
       * @visibility frontend
       */
      id: string;
      /**
       * The url of the server.
       * @visibility frontend
       */
      url: string;
      /**
       * The access token for authenticating server.
       * @visibility secret
       */
      token?: string;
    }>;
  };
}
