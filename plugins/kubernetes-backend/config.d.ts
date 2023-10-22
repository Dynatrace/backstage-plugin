export interface Config {
  'dynatrace-kubernetes-plugin': {
    /**
     * @visibility secret
     */
    clientId: string;
    /**
     * @visibility secret
     */
    clientSecret: string;
    /**
     * @visibility frontend
     */
    environmentIds: string[];
  };
}
