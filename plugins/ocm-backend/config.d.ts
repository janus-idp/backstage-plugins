import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

interface KubernetesPluginRef {
  /**
   * Match the cluster name in kubernetes plugin config
   */
  kubernetesPluginRef: string;
}

interface HubClusterConfig {
  /**
   * Url of the hub cluster API endpoint
   */
  url: string;
  /**
   * Name that the hub cluster will assume in Backstage Catalog (in OCM this is always local-cluster which can be confusing)
   */
  name: string;
  /**
   * Service Account Token which is used for querying data from the hub
   * @visibility secret
   */
  serviceAccountToken?: string;
  /**
   * Skip TLS certificate verification presented by the API server, defaults to false
   */
  skipTLSVerify?: boolean;
  /**
   * Base64-encoded CA bundle in PEM format used for verifying the TLS cert presented by the API server
   */
  caData?: string;
}

export interface Config {
  catalog?: {
    providers?: {
      ocm?: {
        /**
         * Key is reflected as provider ID. Defines and claims plugin instance ownership of entities
         */
        [key: string]: (KubernetesPluginRef | HubClusterConfig) & {
          /**
           * Owner reference to created cluster entities in the catalog
           */
          owner?: string;
          schedule?: TaskScheduleDefinitionConfig;
        };
      };
    };
  };
}
