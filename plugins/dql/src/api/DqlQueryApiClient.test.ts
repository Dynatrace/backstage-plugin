import { DqlQueryApiClient } from './DqlQueryApiClient';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function mockFetchResponse(
  response: any,
  url: string = '*',
  queryParams: string | null = null,
) {
  server.use(
    rest.get(url, (req, res, ctx) => {
      if (
        queryParams === null ||
        req.url.searchParams.toString() === queryParams
      ) {
        return res(ctx.json(response));
      }
      return res(ctx.status(404));
    }),
  );
}

function mockDiscoveryApiUrl(url: string): DiscoveryApi {
  const discoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue(url),
  };
  return discoveryApi;
}

describe('DQLQueryApiClient', () => {
  beforeAll(() => server.listen());
  beforeEach(() => jest.resetAllMocks());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should ask the discovery API for the DQL query API URL', async () => {
    mockFetchResponse([]);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await client.getData('namespace', 'queryName', 'component');

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('dynatrace-dql');
  });

  it('should encode the component parameter', async () => {
    const discoveryApiUrl = 'https://discovery-api.com';
    const namespace = 'namespace';
    const queryName = 'query';
    const component = 'component^^^';
    const url = `${discoveryApiUrl}/${namespace}/${queryName}`;
    const queryParams = `component=component%5E%5E%5E`;
    mockFetchResponse([], url, queryParams);
    const discoveryApi = mockDiscoveryApiUrl(discoveryApiUrl);
    const client = new DqlQueryApiClient({ discoveryApi });

    const result = await client.getData(namespace, queryName, component);

    expect(result).toEqual([]);
  });

  it('should return the data from fetch', async () => {
    const response = [{ column: 'value' }];
    mockFetchResponse(response);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    const result = await client.getData('namespace', 'queryName', 'component');

    expect(result).toEqual(response);
  });

  it('should reject for non-json data', async () => {
    server.use(
      rest.get('*', (_, res, ctx) => {
        return res(ctx.text('not json'));
      }),
    );

    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData('namespace', 'queryName', 'component'),
    ).rejects.toThrow('invalid json');
  });

  it('should reject for invalid TabularData', async () => {
    mockFetchResponse({});
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await expect(
      client.getData('namespace', 'queryName', 'component'),
    ).rejects.toThrow();
  });
});
