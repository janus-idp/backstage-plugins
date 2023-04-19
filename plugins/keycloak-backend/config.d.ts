interface KeycloakOrg {
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
   * Keycloak credentials. Use together with "password".
   */
  username: string;
  /**
   * Keycloak credentials. Use together with "username".
   * @visibility secret
   */
  password: string;
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

export interface Config {
  catalog?: {
    providers?: {
      keycloakOrg?: {
        [key: string]:
          | Omit<KeycloakOrg, 'username' | 'password'>
          | Omit<KeycloakOrg, 'clientId' | 'clientSecret'>;
      };
    };
  };
}
