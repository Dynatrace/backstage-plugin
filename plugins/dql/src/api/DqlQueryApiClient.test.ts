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
import { DqlQueryApiClient } from './DqlQueryApiClient';
import { DiscoveryApi } from '@backstage/core-plugin-api';

const fetchMock = jest.spyOn(global, 'fetch');
const mockFetchResponse = (
  data: any,
  properties?: Partial<Awaited<ReturnType<typeof fetch>>>,
) => {
  fetchMock.mockResolvedValue({
    headers: new Headers(),
    status: 200,
    async json() {
      if (typeof data === 'string') {
        throw new Error('Unexpected token');
      }
      return data;
    },
    // @ts-ignore
    async blob() {
      return {
        async text() {
          return typeof data === 'string' ? data : JSON.stringify(data);
        },
      };
    },
    ...properties,
  });
};

const mockDiscoveryApiUrl = (url: string): DiscoveryApi => {
  return {
    getBaseUrl: jest.fn().mockResolvedValue(url),
  };
};

const mockedEntityRef = 'component:default/example';
const mockedIdentityToken = 'mock-token';

describe('DQLQueryApiClient', () => {
  beforeEach(() => jest.resetAllMocks());

  it('should ask the discovery API for the DQL query API URL', async () => {
    mockFetchResponse([]);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await client.getData(
      'namespace',
      'queryName',
      mockedEntityRef,
      mockedIdentityToken,
    );

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('dynatrace-dql');

    await client.getDataFromQueries(
      'namespace',
      mockedEntityRef,
      mockedIdentityToken,
    );

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('dynatrace-dql');
  });

  it('should encode the component parameter', async () => {
    const discoveryApiUrl = 'https://discovery-api.com';
    const queryNamespace = 'namespace';
    const queryName = 'query';
    mockFetchResponse([]);
    const discoveryApi = mockDiscoveryApiUrl(discoveryApiUrl);
    const client = new DqlQueryApiClient({ discoveryApi });

    const result = await client.getData(
      queryNamespace,
      queryName,
      mockedEntityRef,
      mockedIdentityToken,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${discoveryApiUrl}/${queryNamespace}/${queryName}?entityRef=component%3Adefault%2Fexample`,
      expect.anything(),
    );
    expect(result).toEqual([]);
  });

  it('should return the data from function getData()', async () => {
    const response = [{ column: 'value' }];
    mockFetchResponse(response);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    const result = await client.getData(
      'queryNamespace',
      'queryName',
      mockedEntityRef,
      mockedIdentityToken,
    );

    expect(result).toEqual(response);
  });

  it('should return the data from function getDataFromQueries()', async () => {
    const response = [{ title: 'queryTitle', data: [{ column: 'value' }] }];
    mockFetchResponse(response);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    const result = await client.getDataFromQueries(
      'queryNamespace',
      mockedEntityRef,
      mockedIdentityToken,
    );
    expect(result).toEqual(response);
  });

  it('should reject for non-json data', async () => {
    mockFetchResponse('not json');
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData(
        'queryNamespace',
        'queryName',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow(/Unexpected token/);

    await expect(
      client.getDataFromQueries(
        'queryNamespace',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow(/Unexpected token/);
  });

  it('should reject for invalid TabularData', async () => {
    mockFetchResponse({});
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData(
        'queryNamespace',
        'queryName',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow();

    await expect(
      client.getDataFromQueries(
        'queryNamespace',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow();
  });

  it('should report when a query is not found', async () => {
    const statusCode = 404;
    const statusText = 'Not Found';

    mockFetchResponse(undefined, { status: statusCode, statusText });

    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData(
        'queryNamespace',
        'queryName',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow(`Query queryNamespace/queryName does not exist.`);

    await expect(
      client.getDataFromQueries(
        'queryNamespace',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow(`Query queryNamespace does not exist.`);
  });

  it('should report any generic error to the frontend', async () => {
    const statusCode = 500;
    const statusText = "It's broken";
    mockFetchResponse(undefined, { status: statusCode, statusText });

    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData(
        'queryNamespace',
        'queryName',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow("Request failed with 500 It's broken");

    await expect(
      client.getDataFromQueries(
        'queryNamespace',
        mockedEntityRef,
        mockedIdentityToken,
      ),
    ).rejects.toThrow("Request failed with 500 It's broken");
  });
});
