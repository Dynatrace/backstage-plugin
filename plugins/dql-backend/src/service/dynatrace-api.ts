import { dtFetch } from '../utils';
import { DynatraceConfig } from './dynatrace-config';
import { getAccessToken } from './dynatract-auth';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export type DynatraceAccessInfo = {
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

export class DynatraceApi {
  constructor(private readonly config: DynatraceConfig) {}

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
