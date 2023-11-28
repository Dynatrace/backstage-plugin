import { parseCustomQueries, parseEnvironments } from './config-parser';
import { MockConfigApi } from '@backstage/test-utils';

const TEST_ENVIRONMENT = {
  name: 'test',
  url: 'https://test.dynatrace.com',
  tokenUrl: 'https://test.dynatrace.com',
  clientId: 'test',
  clientSecret: 'test',
  accountUrn: 'test',
};

describe('config-parser', () => {
  describe('parseEnvironments', () => {
    it('should return a list of DynatraceApis with the corresponding config', () => {
      const config = new MockConfigApi({
        dynatrace: { environments: [TEST_ENVIRONMENT] },
      });
      const result = parseEnvironments(config);

      expect(result).toHaveLength(1);
      const api = result[0];
      expect(api.environmentName).toEqual(TEST_ENVIRONMENT.name);
      expect(api.environmentUrl).toEqual(TEST_ENVIRONMENT.url);
    });
  });

  describe('parseCustomQueries', () => {
    it('should return a list of custom queries', () => {
      const queryId = 'test';
      const query = 'fetch...';

      const config = new MockConfigApi({
        dynatrace: {
          queries: [
            {
              id: queryId,
              query: query,
            },
          ],
        },
      });
      const result = parseCustomQueries(config);

      expect(result).toEqual({ [queryId]: query });
    });
  });
});
