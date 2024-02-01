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
import { QueryExecutor } from './queryExecutor';

describe('queryExecutor', () => {
  const executor = new QueryExecutor([], { 'my.id': 'myQuery' });
  const inputVariables = {
    componentNamespace: 'namespace',
    componentName: 'name',
  };

  describe('Invalid IDs', () => {
    it('should throw an error if a custom query is undefined', async () => {
      // assert
      await expect(() =>
        executor.executeCustomQuery('not.existing', inputVariables),
      ).rejects.toThrow();
    });

    it('should throw an error if a Dynatrace query is undefined', async () => {
      // assert
      await expect(() =>
        executor.executeDynatraceQuery('not.existing', inputVariables),
      ).rejects.toThrow();
    });
  });

  describe('Valid IDs', () => {
    it('should not throw an error if a custom query is defined', async () => {
      // act
      const result = await executor.executeCustomQuery('my.id', inputVariables);
      // assert
      expect(result).toEqual([]);
    });

    it('should not throw an error if a Dynatrace query is defined', async () => {
      // act
      const result = await executor.executeDynatraceQuery(
        'kubernetes-deployments',
        inputVariables,
      );
      // assert
      expect(result).toEqual([]);
    });
  });
});
