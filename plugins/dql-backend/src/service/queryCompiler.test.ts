import { compileDqlQuery } from './queryCompiler';

describe('query-compiler', () => {
  test('compileDqlQuery replaces placeholders with variables', () => {
    const query = `
      fetch dt.entity.cloud_application
    | fields name = entity.name, namespace.id = belongs_to[dt.entity.cloud_application_namespace], backstageComponent = cloudApplicationLabels[\`backstage.io/component\`]
    | filter backstageComponent == "\${componentNamespace}.\${componentName}"
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespace = Namespace}
    `;
    const variables = {
      componentName: 'nginx',
      componentNamespace: 'default',
    };

    const compiledQuery = compileDqlQuery(query, variables);

    expect(compiledQuery).toEqual(`
      fetch dt.entity.cloud_application
    | fields name = entity.name, namespace.id = belongs_to[dt.entity.cloud_application_namespace], backstageComponent = cloudApplicationLabels[\`backstage.io/component\`]
    | filter backstageComponent == "${variables.componentNamespace}.${variables.componentName}"
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespace = Namespace}
    `);
  });
});
