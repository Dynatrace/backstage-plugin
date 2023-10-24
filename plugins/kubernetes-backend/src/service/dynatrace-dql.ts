import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export interface DynatraceAccessInfo {
  url: string;
  accessToken: string;
}

interface ExecuteQueryResponse {
  state: string;
  requestToken: string;
  ttlSeconds: number;
}

interface PollQueryResponse<RecordType> {
  state: string;
  progress: number;
  result: {
    records: RecordType[];
    types: [
      { indexRange: number[]; mappings: Record<string, { type: string }> },
    ];
    metadata: Record<string, object>;
  };
}

async function executeQuery(
  { url, accessToken }: DynatraceAccessInfo,
  dql: string,
): Promise<ExecuteQueryResponse> {
  const queryExecRes = await fetch(
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
}

async function pollQuery<T>(
  { url, accessToken }: DynatraceAccessInfo,
  requestToken: string,
): Promise<PollQueryResponse<T>> {
  const queryPollRes = await fetch(
    `${url}/platform/storage/query/v1/query:poll?request-token=${requestToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return await queryPollRes.json();
}

async function waitForQueryResult<RecordType>(
  accessInfo: DynatraceAccessInfo,
  requestToken: string,
): Promise<RecordType[]> {
  let pollQueryRes: PollQueryResponse<RecordType> = await pollQuery(
    accessInfo,
    requestToken,
  );
  while (pollQueryRes.state !== 'SUCCEEDED') {
    pollQueryRes = await pollQuery(accessInfo, requestToken);
  }
  return pollQueryRes.result.records;
}

export async function getDeployments(
  accessInfo: DynatraceAccessInfo,
  component: string,
): Promise<TabularData[]> {
  const query = `
    fetch dt.entity.cloud_application
    | fields name = entity.name, namespace.id = belongs_to[dt.entity.cloud_application_namespace], backstageComponent = cloudApplicationLabels[\`backstage.io/component\`]
    | filter backstageComponent == "${component}"
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespace = Namespace}
  `;

  const execQueryRes = await executeQuery(accessInfo, query);
  return await waitForQueryResult(accessInfo, execQueryRes.requestToken);
}
