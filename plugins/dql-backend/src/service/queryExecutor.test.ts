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
import { parseEnvironments } from '../utils/configParser';
import { QueryExecutor } from './queryExecutor';
import { Entity } from '@backstage/catalog-model';
import { MockConfigApi } from '@backstage/test-utils';

describe('queryExecutor', () => {
  const executor = new QueryExecutor([], { 'my.id': 'myQuery' });
  const inputVariables = {
    componentNamespace: 'namespace',
    componentName: 'name',
  };
  const notebookVariables = {
    notebookUrl: 'https://sample.url/',
    notebookId: 'samplenotebookid',
  };
  const entity: Entity = {
    apiVersion: '1.0.0',
    kind: 'component',
    metadata: {
      name: 'componentName',
      annotations: { 'dynatrace.com/notebook-id': 'samplenotebookid' },
    },
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
        executor.executeDynatraceQuery('not.existing', entity),
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
        entity,
      );
      // assert
      expect(result).toEqual([]);
    });
  });

  describe('Notebook Queries', () => {
    it('should throw an error if no notebook query is defined', async () => {
      // assert
      await expect(() =>
        executor.executeCustomNotebookQueries(
          notebookVariables,
          inputVariables,
        ),
      ).rejects.toThrow();
    });

    it('should throw an error if no notebook-url is defined but there is more than 1 environment', async () => {
      // arrange
      const TEST_ENVIRONMENT = {
        name: 'test',
        url: 'https://test.dynatrace.com',
        tokenUrl: 'https://test.dynatrace.com',
        clientId: 'test',
        clientSecret: 'test',
        accountUrn: 'test',
      };

      const config = new MockConfigApi({
        dynatrace: { environments: [TEST_ENVIRONMENT, TEST_ENVIRONMENT] },
      });
      const result = parseEnvironments(config);
      const notebookExecutor = new QueryExecutor(result, {
        'my.id': 'myQuery',
      });
      // act, assert
      await expect(() =>
        notebookExecutor.executeCustomNotebookQueries(
          { notebookId: 'samplenotebookid' },
          inputVariables,
        ),
      ).rejects.toThrow();
    });

    it('should not throw an error if notebook queries are defined', async () => {
      // act

      executor.executeCustomNotebookQueries = jest.fn().mockResolvedValue([
        { data: [], title: 'query-1' },
        { data: [], title: 'query-2' },
      ]);
      const result = await executor.executeCustomNotebookQueries(
        notebookVariables,
        inputVariables,
      );
      // assert

      expect(
        entity.metadata.annotations?.['dynatrace.com/notebook-id'],
      ).toEqual('samplenotebookid');
      expect(result).toEqual([
        { data: [], title: 'query-1' },
        { data: [], title: 'query-2' },
      ]);
    });
  });
});
