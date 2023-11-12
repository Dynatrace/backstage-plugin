import { DynatraceApi } from './dynatrace-api';
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
    variables: Record<string, unknown>,
  ): Promise<TabularData> {
    const query = this.queries[queryId];
    return this.executeQuery(query, variables);
  }

  async executeKubernetesDeploymensQuery(
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const query = `
    fetch dt.entity.cloud_application
    | fields name = entity.name, namespace.id = belongs_to[dt.entity.cloud_application_namespace], backstageComponent = cloudApplicationLabels[\`backstage.io/component\`]
    | filter backstageComponent == "\${componentName}.\${componentNamespace}"
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespace = Namespace}
  `;
    return this.executeQuery(query, variables);
  }

  private async executeQuery(
    dqlQuery: string,
    variables: Record<string, unknown>,
  ): Promise<TabularData> {
    const results$ = this.apis.map(api => {
      const compiledQuery = compileDqlQuery(dqlQuery, {
        ...variables,
        environmentName: api.environmenName,
        environmentUrl: api.environmentUrl,
      });
      return api.executeDqlQuery(compiledQuery);
    });
    const results = await Promise.all(results$);
    return results.reduce((result1, result2) => result1.concat(result2));
  }
}
