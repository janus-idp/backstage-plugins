export interface Config {
  /**
   * Configuration for the Orchestrator plugin.
   */
  orchestrator: {
    baseUrl: string;
    port: string;
    sonataFlowService: {
      path: string;
      container: string;
      owner?: string;
      environment?: string;
      jira?: {
        host?: string;
        /** @visibility secret */
        bearerToken?: string;
      };
    };
    /**
     * Editor-specific configuration.
     */
    editor: {
      /**
       * Path to the envelope (local or remote).
       * @visibility frontend
       */
      path: string;
    };
  };
}
