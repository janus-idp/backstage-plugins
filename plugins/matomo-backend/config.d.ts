export interface Config {
  matomo: {
    /**
     * @visibility backend
     */
    apiToken: string;
    /**
     * @visibility backend
     */
    apiUrl: string;
    /**
     * Set to false if you get SSL certificate error
     * @visibility backend
     */
    secure: boolean;
  };
}
