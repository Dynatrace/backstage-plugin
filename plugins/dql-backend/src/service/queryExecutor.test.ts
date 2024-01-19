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
