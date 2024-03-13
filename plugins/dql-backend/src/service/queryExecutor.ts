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
import { dynatraceQueries } from './queries';
import { compileDqlQuery } from './queryCompiler';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
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
  additionalFilter: z
    .string()
    .optional()
    .transform(filter => filter ?? ''),
});

type ComponentQueryVariables = z.input<typeof componentQueryVariablesSchema>;

export class QueryExecutor {
  constructor(
    private readonly apis: DynatraceApi[],
    private readonly queries: Record<string, string | undefined>,
  ) {}

  async executeCustomQuery(
    queryId: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const query = this.queries[queryId];
    if (!query) {
      throw new Error(`No custom query to the given id "${queryId}" found`);
    }
    return this.executeQuery(query, variables);
  }

  async executeDynatraceQuery(
    queryId: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const query = dynatraceQueries[queryId];
    if (!query) {
      throw new Error(`No Dynatrace query to the given id "${queryId}" found`);
    }
    return this.executeQuery(query, variables);
  }

  private async executeQuery(
    dqlQuery: string,
    variables: ComponentQueryVariables,
  ): Promise<TabularData> {
    const parsedVariables = componentQueryVariablesSchema.parse(variables);

    const results$ = this.apis.map(api => {
      const compiledQuery = compileDqlQuery(dqlQuery, {
        ...parsedVariables,
        environmentName: api.environmentName,
        environmentUrl: api.environmentUrl,
      });
      return api.executeDqlQuery(compiledQuery);
    });
    const results = await Promise.all(results$);
    return results.flatMap(result => result);
  }
}
