export type Config = {
  dynatrace: {
    environments: [
      {
        /**
         * @visibility frontend
         */
        url: string;
        /**
         * @visibility frontend
         */
        name: string;
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
      },
    ];

    queries: {
      [queryId: string]: string;
    };
  };
};
