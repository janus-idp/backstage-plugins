export interface Config {
  permission: {
    rbac: {
      /**
       * Optional configuration for admins, can declare individual users and / or groups
       * @visibility frontend
       */
      admin?: {
        /**
         * The list of users and / or groups with admin access
         * @visibility frontend
         */
        users?: Array<{
          /**
           * @visibility frontend
           */
          name: string;
        }>;
      };
      /**
       * Optional configuration for database
       * @visibility frontend
       */
      database?: {
        /**
         * Whether or not a database will be used
         * @visibility frontend
         */
        enabled: boolean;
      };

      /**
       * An optional list of plugin IDs.
       * The RBAC plugin will handle access control for plugins included in this list.
       */
      pluginsWithPermission?: string[];
    };
  };
}
