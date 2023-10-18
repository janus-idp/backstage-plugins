export interface Config {
  app?: {
    analytics: {
      matomo: {
        /**
         * Matomo host URL
         * @visibility frontend
         */
        host: string;

        /**
         * Matomo siteId for the Backstage Website
         * @visibility frontend
         */
        siteId: string;
      };
    };
  };
}
