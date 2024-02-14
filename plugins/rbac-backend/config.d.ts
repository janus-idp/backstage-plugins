export interface Config {
  permission: {
    rbac: {
      'policies-csv-file'?: string;
      /**
       * Allow for reloading of the CSV file.
       * @visibility frontend
       */
      policyFileReload?: boolean;
      /**
       * Optional configuration for admins
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
        /**
         * The list of super users that will have allow all access, should be a list of only users
         * @visibility frontend
         */
        superUsers?: Array<{
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
