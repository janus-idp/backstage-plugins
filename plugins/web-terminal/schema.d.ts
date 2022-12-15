export interface Config {
  /** webTerminal webSocketServer configuration */
  webTerminal?: {
    // FIXME: changing this to optional because it break the build when included as an internal plugin
    /**
     * The URL of the webSocketServer
     *
     * @visibility frontend
     */
    webSocketUrl: string;
  };
}
