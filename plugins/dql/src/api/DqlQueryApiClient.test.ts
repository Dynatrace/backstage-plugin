import { DqlQueryApiClient } from './DqlQueryApiClient';

function mockFetchResponse(response: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValueOnce(response),
  });
}

function mockDiscoveryApiUrl(url: string) {
  const discoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue(url),
  };
  return discoveryApi;
}

describe('DQLQueryApiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should ask the discovery API for the DQL query API URL', async () => {
    mockFetchResponse([]);
    const discoveryApi = mockDiscoveryApiUrl('https://discovery-api.com');
    const client = new DqlQueryApiClient({ discoveryApi });

    await client.getData('namespace', 'queryName', 'component');

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('dynatrace-dql');
  });

  it('should fetch the correct URL', async () => {
    mockFetchResponse([]);
    const discoveryApiUrl = 'https://discovery-api.com';
    const discoveryApi = mockDiscoveryApiUrl(discoveryApiUrl);
    const client = new DqlQueryApiClient({ discoveryApi });

    const namespace = 'namespace';
    const queryName = 'query';
    const component = 'component';
    await client.getData(namespace, queryName, component);

    expect(global.fetch).toHaveBeenCalledWith(
      `${discoveryApiUrl}/${namespace}/${queryName}?component=${encodeURIComponent(
        component,
      )}`,
      { method: 'GET' },
    );
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValueOnce(new Error('invalid json')),
    });
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
