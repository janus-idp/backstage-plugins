import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  catalog?: {
    providers?: {
      keycloakOrg?: {
        [key: string]: {
          /**
           * KeycloakOrgConfig
           */
          /**
           * Location of the Keycloak instance
           */
          baseUrl: string;
          /**
           * Keycloak realm name. This realm is scraped and entities are
           */
          realm?: string;
          /**
           * Keycloak realm name. This realm is used for authentication using the credentials below.
           */
          loginRealm?: string;
          /**
           * The number of users to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many users at once.
           * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_users_resource
           */
          userQuerySize?: number;
          /**
           * The number of groups to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many groups at once.
           * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_groups_resource
           */
          groupQuerySize?: number;
          schedule?: TaskScheduleDefinitionConfig;
        } & (
          | {
              /**
               * KeycloakClientCredentials
               */
              /**
               * Keycloak credentials. Use together with "password".
               */
              username: string;
              /**
               * Keycloak credentials. Use together with "username".
               * @visibility secret
               */
              password: string;
            }
          | {
              /**
               * KeycloakClientCredentials
               */
              /**
               * Keycloak credentials. Use together with "clientSecret".
               */
              clientId: string;
              /**
               * Keycloak credentials. Use together with "clientId".
               * @visibility secret
               */
              clientSecret: string;
            }
        );
      };
    };
  };
}
