export interface Config {
  notifications?: {
    /* Workaround for issues with external caller JWT token creation.
     When following config option is not provided and the request "authentication" header is missing, the request is ALLOWED by default
     When following option is present, the request must contain either a valid JWT token or that provided shared secret in the "notifications-secret" header
     */
    externalCallerSecret?: string;
  };
}
