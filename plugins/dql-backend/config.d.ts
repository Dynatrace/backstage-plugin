export interface Config {
  dynatrace: {
    /**
     * @visibility secret
     */
    clientId: string;
    /**
     * @visibility secret
     */
    clientSecret: string;
    /**
     * @visibility secret
     */
    accountUrn: string;
    /**
     * @visibility backend
     */
    tokenUrl: string;
    /**
     * @visibility frontend
     */
    url: string;
  };
}
