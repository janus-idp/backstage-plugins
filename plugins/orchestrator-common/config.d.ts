export interface Config {
  /**
   * Configuration for the Orchestrator plugin.
   */
  orchestrator: {
    sonataFlowService: {
      /**
       * Base URL of the Sonata Flow service.
       * Example: http://localhost
       */
      baseUrl: string;
      /**
       * Port of the Sonata Flow service.
       * Example: 8080
       */
      port: string;
      /**
       * Path to map workflow resources to SonataFlow service.
       * Example: /home/orchestrator/workflows
       */
      path: string;
      /**
       * Container image name of the Sonata Flow service.
       * Default: quay.io/kiegroup/kogito-swf-devmode-nightly:main-2023-08-30
       */
      container?: string;
      /**
       * Persistance configuration of the Sonata Flow service.
       */
      persistance?: {
        /**
         * Path in the container image to store persistance data.
         * Default: /home/kogito/persistence
         */
        path?: string;
      };
    };
    /**
     * Configuration for the integration with the Catalog plugin.
     */
    catalog?: {
      /**
       * Owner of workflows to present on the component catalog.
       * Default: infrastructure
       */
      owner?: string;
      /**
       * Environment of workflows to present on the component catalog.
       * Default: development
       */
      environment?: string;
    };
    /**
     * Configuration for the workflow editor.
     */
    editor?: {
      /**
       * Path to the envelope context (either a remote url or a local path under app/public folder).
       * Default: https://start.kubesmarts.org
       * @visibility frontend
       */
      path?: string;
    };
    /**
     * Configuration for the integration with Jira API.
     * Note: This is a temporary solution. We should probably use the JIRA integration config instead.
     */
    jira?: {
      /**
       * Base URL of the Jira API.
       */
      host?: string;
      /**
       * Token to authenticate with the Jira API.
       * @visibility secret
       */
      bearerToken?: string;
    };
  };
}
