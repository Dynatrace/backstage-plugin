import { DynatraceApi } from './dynatraceApi';
import { dynatraceQueries } from './queries';
import { compileDqlQuery } from './queryCompiler';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { z } from 'zod';

const componentQueryVariablesSchema = z.object({
  // see https://backstage.io/docs/features/software-catalog/descriptor-format#namespace-optional
  componentNamespace: z
    .string()
    .max(63)
    .regex(/^[A-Za-z1-9\-]+$/),
  // see https://backstage.io/docs/features/software-catalog/descriptor-format#name-required
  componentName: z
    .string()
    .max(63)
    .regex(/^[A-Za-z1-9\-_\.]+$/),
});

type ComponentQueryVariables = z.infer<typeof componentQueryVariablesSchema>;

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
    const query = dynatraceQueries[queryId];
    return this.executeQuery(query, variables);
  }

  private async executeQuery(
    dqlQuery: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    componentQueryVariablesSchema.parse(variables);

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
