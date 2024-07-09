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

  async executeCustomCatalogQueries(
    catalogQuery: EntityQuery | undefined,
    variables: ComponentQueryVariables,
  ): Promise<TabularData | undefined> {
    componentQueryVariablesSchema.parse(variables);
    if (!catalogQuery) {
      throw new Error(`No custom catalog query found`);
    }
    const results$ = this.apis.map(api => {
      const compiledQuery = compileDqlQuery(catalogQuery.query, {
        ...variables,
        environmentName: api.environmentName,
        environmentUrl: api.environmentUrl,
      });
      return api.executeDqlQuery(compiledQuery);
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
