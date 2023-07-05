export interface Config {
  permission: {
    /**
     * Optional configuration for admins, can declare individual users and / or groups
     * @visibility frontend
     */
    admin?: {
      /**
       * The list of users with admin access
       * @visibility frontend
       */
      users?: Array<{
        /**
         * @visibility frontend
         */
        name: string;
      }>;
      /**
       * @visibility frontend
       * The list of groups with admin access
       */
      groups?: Array<{
        /**
         * @visibility frontend
         */
        name: string;
      }>;
    };
  };
}
