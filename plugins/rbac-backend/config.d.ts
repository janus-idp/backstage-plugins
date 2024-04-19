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
       * An optional list of plugin IDs.
       * The RBAC plugin will handle access control for plugins included in this list.
       */
      pluginsWithPermission?: string[];
      /**
       * An optional cache that can be used to help with performance issues
       * Stores the groups that a user is attached to
       * @visibility frontend
       */
      cache?: {
        /**
         * The maximum size of the cache
         * @visibility frontend
         */
        maxSize?: number;
        /**
         * The expiration time of the cached user in milliseconds
         * @visibility frontend
         */
        expiration?: number;
      };
    };
  };
}
