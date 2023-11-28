import { DynatraceApi } from './dynatrace-api';
import { dynatraceQueries } from './queries';
import { compileDqlQuery } from './query-compiler';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

type ComponentQueryVariables = {
  componentNamespace: string;
  componentName: string;
};

export class QueryExecutor {
  constructor(
    private readonly apis: DynatraceApi[],
    private readonly queries: Record<string, string>,
  ) {}

  async executeCustomQuery(
    queryId: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const query = this.queries[queryId];
    return this.executeQuery(query, variables);
  }

  async executeDynatraceQuery(
    queryId: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    return this.executeQuery(dynatraceQueries[queryId], variables);
  }

  private async executeQuery(
    dqlQuery: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const results$ = this.apis.map(api => {
      const compiledQuery = compileDqlQuery(dqlQuery, {
        ...variables,
        environmentName: api.environmentName,
        environmentUrl: api.environmentUrl,
      });
      return api.executeDqlQuery(compiledQuery);
    });
    const results = await Promise.all(results$);
    return results.reduce((result1, result2) => result1.concat(result2));
  }
}
