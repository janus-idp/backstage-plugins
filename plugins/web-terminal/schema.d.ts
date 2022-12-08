export interface Config {
  /** webTerminal webSocketServer configuration */
  webTerminal: {
    /**
     * The URL of the webSocketServer
     *
     * @visibility frontend
     */
    webSocketUrl: string;
  };
}
