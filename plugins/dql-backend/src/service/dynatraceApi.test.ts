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
import {
  DynatraceApi,
  DynatraceEnvironmentConfig,
  ExecuteQueryResponse,
  NotebookContent,
  PollQueryResponse,
  TokenResponse,
} from './dynatraceApi';

jest.mock('../utils', () => ({ dtFetch: jest.fn() }));

const dtFetchMock = dtFetch as jest.Mock<
  ReturnType<typeof dtFetch>,
  Parameters<typeof dtFetch>
>;

type MockResult<T> = {
  ok?: boolean;
  text?: string;
  json?: T;
};

describe('dynatraceApi', () => {
  const mockResult = <T>(result: MockResult<T>) => {
    const ok = result.ok ?? true;
    // @ts-ignore
    dtFetchMock.mockResolvedValueOnce({
      ok,
      async text() {
        return result.text ?? 'error';
      },
      status: ok ? 200 : 400,
      async json() {
        return result.json ?? {};
      },
    });
  };
  const defaultApiConfig: DynatraceEnvironmentConfig = {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    url: 'https://example.com',
    tokenUrl: 'https://example.com/token',
    name: 'myEnv',
    accountUrn: 'urn',
  };
  const dynatraceApi = new DynatraceApi(defaultApiConfig, 'identifier');
  const trailingSlashApi = new DynatraceApi(
    { ...defaultApiConfig, url: 'https://example.com/' },
    'identifier',
  );

  const mockTokenResult = (result: MockResult<TokenResponse>) =>
    mockResult(result);
  const mockExecuteResult = (result: MockResult<ExecuteQueryResponse>) =>
    mockResult(result);
  const mockExecuteNotebookResult = (result: MockResult<NotebookContent>) =>
    mockResult(result);
  const mockPollResult = (result: MockResult<PollQueryResponse<unknown>>) =>
    mockResult(result);

  // expect calls instead of toHaveBeenCalledWith because objects like URL are not correctly validated
  const assertTokenCall = (
    url: string,
    identifier: string,
    body: URLSearchParams,
  ) => {
    expect(dtFetchMock.mock.calls[0][0].toString()).toEqual(url);
    expect(dtFetchMock.mock.calls[0][1]).toEqual(identifier);
    expect(dtFetchMock.mock.calls[0][2]?.body?.toString()).toEqual(
      body.toString(),
    );
  };

  const assertExecuteCall = (
    url: string,
    identifier: string,
    authHeader?: string,
    index = 1,
  ) => {
    expect(dtFetchMock.mock.calls[index][0].toString()).toEqual(url);
    expect(dtFetchMock.mock.calls[index][1]).toEqual(identifier);
    expect(dtFetchMock.mock.calls[index][2]?.headers).toHaveProperty(
      'Authorization',
      authHeader ?? expect.any(String),
    );
  };

  const assertPollCall = (
    url: string,
    identifier: string,
    authHeader?: string,
  ) => {
    assertExecuteCall(url, identifier, authHeader, 2);
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be a successful call: getAccessToken, executeQuery, waitForQueryResult', async () => {
    // arrange
    mockTokenResult({
      json: {
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 10_000,
        resource: 'resource',
        scope: 'my scopes',
      },
    });
    mockExecuteResult({
      json: { state: 'RUNNING', requestToken: 'myToken', ttlSeconds: 200 },
    });
    mockPollResult({
      json: {
        state: 'SUCCEEDED',
        result: { records: [], metadata: {}, types: [] },
        progress: 100,
      },
    });

    // act
    await dynatraceApi.executeDqlQuery('my query');

    // assert
    const expectedSearchParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'clientId',
      client_secret: 'clientSecret',
      resource: 'urn',
    });
    assertTokenCall(
      'https://example.com/token',
      'identifier',
      expectedSearchParams,
    );
    assertExecuteCall(
      'https://example.com/platform/storage/query/v1/query:execute',
      'identifier',
      'Bearer token',
    );
    assertPollCall(
      'https://example.com/platform/storage/query/v1/query:poll?request-token=myToken',
      'identifier',
      'Bearer token',
    );
  });

  it('should be a successful call: getAccessToken, executeNotebook', async () => {
    // arrange
    mockTokenResult({
      json: {
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 10_000,
        resource: 'resource',
        scope: 'my scopes',
      },
    });
    mockExecuteNotebookResult({
      json: {
        version: '1',
        defaultTimeframe: { from: 'now()-7d', to: 'now()' },
        sections: [
          {
            id: 'my-id',
            type: 'dql',
            showTitle: false,
            state: {
              input: {
                value: 'fetch data',
              },
            },
            title: 'Error Logs',
          },
        ],
      },
    });
    const documentId = 'my-notebook';
    // act
    await dynatraceApi.executeNotebook(documentId);

    // assert
    const expectedSearchParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'clientId',
      client_secret: 'clientSecret',
      resource: 'urn',
    });
    assertTokenCall(
      'https://example.com/token',
      'identifier',
      expectedSearchParams,
    );
    assertExecuteCall(
      `https://example.com/platform/document/v1/documents/${documentId}/content`,
      'identifier',
      'Bearer token',
    );
  });

  describe('getAccessToken', () => {
    it('should throw an error if the token request failed', async () => {
      // arrange
      mockTokenResult({ ok: false, text: 'invalid' });

      // act, assert
      await expect(() =>
        dynatraceApi.executeDqlQuery('my query'),
      ).rejects.toThrow(
        'Failed to get access token for environment myEnv (https://example.com)',
      );
      await expect(() =>
        dynatraceApi.executeNotebook('my-notebook'),
      ).rejects.toThrow();
      expect(dtFetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('executeQuery', () => {
    beforeEach(() => {
      mockTokenResult({
        json: {
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 10_000,
          resource: 'resource',
          scope: 'my scopes',
        },
      });
      mockExecuteResult({ ok: false, text: '400: Invalid query' });
    });

    it('should throw an error if fetch is not ok', async () => {
      // act, assert
      await expect(() =>
        dynatraceApi.executeDqlQuery('my query'),
      ).rejects.toThrow('400: Invalid query');
      expect(dtFetchMock).toHaveBeenCalledTimes(2);
    });

    it('should ignore trailing slash in the environment URL', async () => {
      // act, assert
      await expect(() =>
        trailingSlashApi.executeDqlQuery('my query'),
      ).rejects.toThrow();
      assertExecuteCall(
        'https://example.com/platform/storage/query/v1/query:execute',
        'identifier',
      );
    });
  });

  describe('waitForQueryResult', () => {
    beforeEach(() => {
      mockTokenResult({
        json: {
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 10_000,
          resource: 'resource',
          scope: 'my scopes',
        },
      });
      mockExecuteResult({
        json: { state: 'RUNNING', requestToken: 'myToken', ttlSeconds: 200 },
      });
      mockPollResult({ ok: false, text: '400: Invalid token' });
    });

    it('should throw an error if fetch is not ok', async () => {
      // act, assert
      await expect(() =>
        dynatraceApi.executeDqlQuery('my query'),
      ).rejects.toThrow(
        'Failed to poll query results for request token myToken',
      );
      expect(dtFetchMock).toHaveBeenCalledTimes(3);
    });

    it('should ignore trailing slash in the environment URL', async () => {
      // act, assert
      await expect(() =>
        trailingSlashApi.executeDqlQuery('my query'),
      ).rejects.toThrow();
      assertPollCall(
        'https://example.com/platform/storage/query/v1/query:poll?request-token=myToken',
        'identifier',
      );
    });
  });
});
