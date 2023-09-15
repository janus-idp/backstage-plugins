export interface Config {
  /**
   * Configuration for the Orchestrator plugin.
   */
  swf: {
    baseUrl: string;
    port: string;
    workflowService: {
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
