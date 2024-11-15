export interface Config {
  /**
   * Configuration required for using lightspeed
   * @visibility frontend
   */
  lightspeed: {
    /**
     * @visibility frontend
     */
    servers: Array</**
     * @visibility frontend
     */
    {
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
    }>;
  };
}
