import { dtFetch } from '../utils';
import { getRootLogger } from '@backstage/backend-common';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export type DynatraceEnvironmentConfig = {
  name: string;
  url: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  accountUrn: string;
};

type TokenResponse = {
  scope: string;
  token_type: string;
  expires_in: number;
  access_token: string;
  resource: string;
};

type DynatraceAccessInfo = {
  url: string;
  accessToken: string;
};

type ExecuteQueryResponse = {
  state: string;
  requestToken: string;
  ttlSeconds: number;
};

type PollQueryResponse<RecordType> = {
  state: string;
  progress: number;
  result: {
    records: RecordType[];
    types: [
      { indexRange: number[]; mappings: Record<string, { type: string }> },
    ];
    metadata: Record<string, object>;
  };
};

const logger = getRootLogger().child({ plugin: 'dql-backend' });
const DEFAULT_TOKEN_URL = 'https://sso.dynatrace.com/sso/oauth2/token';

const executeQuery = async (
  { url, accessToken }: DynatraceAccessInfo,
  dql: string,
): Promise<ExecuteQueryResponse> => {
  const queryExecRes = await dtFetch(
    `${url}/platform/storage/query/v1/query:execute`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dql),
    },
  );
  return await queryExecRes.json();
};

const pollQuery = async <T>(
  { url, accessToken }: DynatraceAccessInfo,
  requestToken: string,
): Promise<PollQueryResponse<T>> => {
  const queryPollRes = await dtFetch(
    `${url}/platform/storage/query/v1/query:poll?request-token=${encodeURIComponent(
      requestToken,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (queryPollRes.status !== 200) {
    logger.error(
      `Failed to poll query results for request token ${requestToken}`,
    );
    throw new Error(
      `Failed to poll query results for request token ${requestToken}`,
    );
  }
  return await queryPollRes.json();
};

const waitForQueryResult = async <RecordType>(
  accessInfo: DynatraceAccessInfo,
  requestToken: string,
): Promise<RecordType[]> => {
  let pollQueryRes: PollQueryResponse<RecordType> = await pollQuery(
    accessInfo,
    requestToken,
  );
  while (pollQueryRes.state !== 'SUCCEEDED') {
    pollQueryRes = await pollQuery(accessInfo, requestToken);
  }
  return pollQueryRes.result.records;
};

const getAccessToken = async (
  config: DynatraceEnvironmentConfig,
): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    resource: config.accountUrn,
  });
  const tokenRes = await dtFetch(config.tokenUrl ?? DEFAULT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (tokenRes.status !== 200) {
    logger.error(
      `Failed to get access token for environment ${config.name} (${config.url})`,
    );
    throw new Error(
      `Failed to get access token for environment ${config.name} (${config.url})`,
    );
  }
  return await tokenRes.json();
};

export class DynatraceApi {
  constructor(private readonly config: DynatraceEnvironmentConfig) {}

  get environmentName() {
    return this.config.name;
  }

  get environmentUrl() {
    return this.config.url;
  }

  async executeDqlQuery(query: string): Promise<TabularData> {
    const tokenResponse = await getAccessToken(this.config);
    const environment: DynatraceAccessInfo = {
      url: this.config.url,
      accessToken: tokenResponse.access_token,
    };

    const execQueryRes = await executeQuery(environment, query);
    return await waitForQueryResult(environment, execQueryRes.requestToken);
  }
}
