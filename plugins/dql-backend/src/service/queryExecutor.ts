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
import { DynatraceApi } from './dynatraceApi';
import { dynatraceQueries, isValidDynatraceQueryKey } from './queries';
import { compileDqlQuery } from './queryCompiler';
import { Entity } from '@backstage/catalog-model';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { NotebookQueryData } from '@dynatrace/backstage-plugin-dql/src/api/types';
import { EntityQuery } from '@dynatrace/backstage-plugin-dql/src/components/types';
import { z } from 'zod';

const componentQueryVariablesSchema = z.object({
  // see https://backstage.io/docs/features/software-catalog/descriptor-format#namespace-optional
  componentNamespace: z
    .string()
    .max(63)
    .regex(/^[A-Za-z0-9\-]+$/),
  // see https://backstage.io/docs/features/software-catalog/descriptor-format#name-required
  componentName: z
    .string()
    .max(63)
    .regex(/^[A-Za-z0-9\-_\.]+$/),
});

type ComponentQueryVariables = z.infer<typeof componentQueryVariablesSchema>;
type ComponentNotebookVariables = {
  notebookId: string;
  notebookHost?: string;
};

export class QueryExecutor {
  constructor(
    private readonly apis: DynatraceApi[],
    private readonly queries: Record<string, string | undefined>,
  ) {}

  async executeCustomQuery(
    queryId: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const dqlQuery = this.queries[queryId];
    if (!dqlQuery) {
      throw new Error(`No custom query to the given id "${queryId}" found`);
    }

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
    return results.flatMap(result => result);
  }

  async executeCustomNotebookQueries(
    notebookVariables: ComponentNotebookVariables,
    variables: ComponentQueryVariables,
  ): Promise<NotebookQueryData[] | undefined> {
    componentQueryVariablesSchema.parse(variables);
    if (this.apis.length > 1 && !notebookVariables.notebookHost) {
      throw new Error(
        `The annotation notebook-id is only supported in the context of a single Dynatrace environment`,
      );
    }

    const filteredApis = notebookVariables.notebookHost
      ? this.apis.filter(
          api =>
            new URL(api.config.url).origin === notebookVariables.notebookHost,
        )
      : this.apis;

    const notebookResults$ = filteredApis.map(api =>
      api.executeNotebook(notebookVariables.notebookId),
    );

    const notebookResults = await Promise.all(notebookResults$);
    const notebookSections = notebookResults.flatMap(
      result => result?.sections ?? [],
    );
    const notebookQueries: EntityQuery[] = notebookSections.map(section => {
      return {
        name: section.title ? section.title : '',
        query: section.state.input.value,
      };
    });

    const results$ = filteredApis.map(api => {
      const queryPromises = notebookQueries.map(async notebookQueries => {
        const compiledQuery = compileDqlQuery(notebookQueries.query, {
          ...variables,
          environmentName: api.environmentName,
          environmentUrl: api.environmentUrl,
        });
        return {
          title: notebookQueries.name,
          data: await api.executeDqlQuery(compiledQuery),
        };
      });
      return Promise.all(queryPromises);
    });
    const results = await Promise.all(results$);
    return results.flatMap(result => result);
  }

  async executeDynatraceQuery(
    queryId: string,
    entity: Entity,
  ): Promise<TabularData> {
    if (!isValidDynatraceQueryKey(queryId)) {
      throw new Error(`No Dynatrace query to the given id "${queryId}" found`);
    }
    const results$ = this.apis.map(api =>
      api.executeDqlQuery(dynatraceQueries[queryId](entity, api)),
    );
    const results = await Promise.all(results$);
    return results.flatMap(result => result);
  }
}
