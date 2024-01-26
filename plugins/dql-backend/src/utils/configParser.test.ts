/* Copyright [2024] [Dynatrace]
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.*/
import { parseCustomQueries, parseEnvironments } from './configParser';
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
