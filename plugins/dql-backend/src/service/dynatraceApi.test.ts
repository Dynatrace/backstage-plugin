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
  PollQueryResponse,
  TokenResponse,
} from './dynatraceApi';
import { Logger } from 'winston';

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

  const platformTokenApiConfig: DynatraceEnvironmentConfig = {
    platformToken: 'dt.token.from.platform.6789',
    url: 'https://example.com',
    name: 'myEnv',
  };

  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const dynatraceApi = new DynatraceApi(defaultApiConfig, 'identifier', logger);

  const trailingSlashApi = new DynatraceApi(
    { ...defaultApiConfig, url: 'https://example.com/' },
    'identifier',
    logger,
  );

  const dynatracePlatformTokenApi = new DynatraceApi(platformTokenApiConfig, 'identifier', logger);

  const mockTokenResult = (result: MockResult<TokenResponse>) =>
    mockResult(result);
  const mockExecuteResult = (result: MockResult<ExecuteQueryResponse>) =>
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
    index = 2
  ) => {
    assertExecuteCall(url, identifier, authHeader, index);
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

  it('should support Dynatrace Platform Tokens', async () => {
    // arrange
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
    await dynatracePlatformTokenApi.executeDqlQuery('my query');

    // assert
    assertExecuteCall(
      'https://example.com/platform/storage/query/v1/query:execute',
      'identifier',
      'Bearer dt.token.from.platform.6789',
      0,
    );
    assertPollCall(
      'https://example.com/platform/storage/query/v1/query:poll?request-token=myToken',
      'identifier',
      'Bearer dt.token.from.platform.6789',
      1,
    );
  });

  it('should remove trailing slashes for the URL', () => {
    // arrange
    const dynatraceApi = new DynatraceApi(
      { ...defaultApiConfig, url: 'https://example.com/' },
      'identifier',
      logger,
    );

    // assert
    expect(dynatraceApi.environmentUrl).toBe('https://example.com');
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
      expect(dtFetchMock).toHaveBeenCalledTimes(1);
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

  describe('logger', () => {
    let oldEnv: NodeJS.ProcessEnv;

    afterAll(() => {
      process.env = oldEnv;
    });

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

      oldEnv = process.env;
      process.env = { ...process.env, LOG_QUERY: 'true' };
    });

    it('should show logs', async () => {
      const loggerInfoFn = logger.info;
      process.env = { LOG_QUERY: 'true' };
      await expect(() =>
        dynatraceApi.executeDqlQuery('my query'),
      ).rejects.toThrow(
        'Failed to poll query results for request token myToken',
      );
      // act, assert
      expect(loggerInfoFn).toHaveBeenCalledTimes(1);
      expect(loggerInfoFn).toHaveBeenCalledWith(
        `Executing DQL query: my query`,
      );
    });

    it('should not show logs', async () => {
      const loggerInfoFn = logger.info;
      process.env = {};
      await expect(() =>
        dynatraceApi.executeDqlQuery('my query'),
      ).rejects.toThrow(
        'Failed to poll query results for request token myToken',
      );
      // act, assert
      expect(loggerInfoFn).toHaveBeenCalledTimes(0);
    });
  });
});
