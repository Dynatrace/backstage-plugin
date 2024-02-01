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
