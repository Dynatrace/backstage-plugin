/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { dtFetch } from '../utils';
import { LoggerService } from '@backstage/backend-plugin-api';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export type DynatraceEnvironmentConfig = {
  name: string;
  url: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  accountUrn: string;
};

export type TokenResponse = {
  scope: string;
  token_type: string;
  expires_in: number;
  access_token: string;
  resource: string;
};

type DynatraceAccessInfo = {
  url: string;
  accessToken: string;
  identifier: string;
};

export type ExecuteQueryResponse = {
  state: string;
  requestToken: string;
  ttlSeconds: number;
};

export type PollQueryResponse<RecordType> = {
  state: string;
  progress: number;
  result: {
    records: RecordType[];
    types: {
      indexRange: number[];
      mappings: Record<string, { type: string }>;
    }[];
    metadata: Record<string, object>;
  };
};

const DEFAULT_TOKEN_URL = 'https://sso.dynatrace.com/sso/oauth2/token';

const executeQuery = async (
  { url, accessToken, identifier }: DynatraceAccessInfo,
  dql: string,
): Promise<ExecuteQueryResponse> => {
  const fullUrl = new URL('platform/storage/query/v1/query:execute', url);
  const queryExecRes = await dtFetch(fullUrl, identifier, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dql),
  });
  if (!queryExecRes.ok) {
    throw new Error(await queryExecRes.text().catch(() => ''));
  }
  return queryExecRes.json();
};

const pollQuery = async <T>(
  { url, accessToken, identifier }: DynatraceAccessInfo,
  requestToken: string,
  logger: LoggerService,
): Promise<PollQueryResponse<T>> => {
  const fullUrl = new URL('platform/storage/query/v1/query:poll', url);
  fullUrl.searchParams.set('request-token', requestToken);

  const queryPollRes = await dtFetch(fullUrl, identifier, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (queryPollRes.status !== 200) {
    const queryPollResBody = await queryPollRes.text();
    const message = `Error: Failed to poll query results for request token ${requestToken} Status: ${queryPollRes.status} ${queryPollRes.statusText} Body: ${queryPollResBody}`;
    logger.error(message);
    throw new Error(message);
  }
  return await queryPollRes.json();
};

const waitForQueryResult = async <RecordType>(
  accessInfo: DynatraceAccessInfo,
  requestToken: string,
  logger: LoggerService,
): Promise<RecordType[]> => {
  let pollQueryRes: PollQueryResponse<RecordType> = await pollQuery(
    accessInfo,
    requestToken,
    logger,
  );
  while (pollQueryRes.state !== 'SUCCEEDED') {
    pollQueryRes = await pollQuery(accessInfo, requestToken, logger);
  }
  return pollQueryRes.result.records;
};

const getAccessToken = async (
  config: DynatraceEnvironmentConfig,
  identifier: string,
  logger: LoggerService,
): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    resource: config.accountUrn,
  });
  const tokenRes = await dtFetch(
    config.tokenUrl ?? DEFAULT_TOKEN_URL,
    identifier,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );
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
  constructor(
    private readonly config: DynatraceEnvironmentConfig,
    private identifier: string,
    private logger: LoggerService,
  ) {}

  get environmentName() {
    return this.config.name;
  }

  get environmentUrl() {
    return this.config.url;
  }

  async executeDqlQuery(query: string): Promise<TabularData> {
    const tokenResponse = await getAccessToken(
      this.config,
      this.identifier,
      this.logger,
    );
    const environment: DynatraceAccessInfo = {
      url: this.config.url,
      accessToken: tokenResponse.access_token,
      identifier: this.identifier,
    };

    const execQueryRes = await executeQuery(environment, query);
    return await waitForQueryResult(
      environment,
      execQueryRes.requestToken,
      this.logger,
    );
  }
}
