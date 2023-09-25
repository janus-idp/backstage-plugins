export interface Config {
  /** Configurations for the ServiceNow custom actions plugin */
  servicenow?: {
    /**
     * The base url of the ServiceNow instance.
     * @visibility frontend
     */
    baseUrl: string;
    /**
     * The username to use for authentication.
     * @visibility frontend
     */
    username: string;
    /**
     * The password to use for authentication.
     * @visibility secret
     */
    password: string;
  };
}
