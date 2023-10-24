export interface Config {
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
