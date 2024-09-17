export interface Config {
  app: {
    branding?: {
      /**
       * Base64 URI for the full logo
       * @visibility frontend
       */
      fullLogo?: string;
      /**
       * size Configuration for the full logo
       * The following units are supported: <number>, px, em, rem, <percentage>
       * @visibility frontend
       */
      fullLogoWidth?: string | number;
      /**
       * Base64 URI for the icon logo
       * @visibility frontend
       */
      iconLogo?: string;
      /**
       * @deepVisibility frontend
       */
      theme?: {
        [key: string]: unknown;
      };
    };
  };

  /** @deepVisibility frontend */
  dynamicPlugins: {
    /** @deepVisibility frontend */
    frontend: {
      [key: string]: {
        dynamicRoutes: ({
          [key: string]: any;
        } & {
          path: string;
          module: string;
          importName: string;
        })[];
        routeBindings: {
          bindTarget: string;
          bindMap: {
            [key: string]: string;
          };
        }[];
      };
    };
  };
}
