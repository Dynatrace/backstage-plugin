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
import { generateKubernetesSelectorFilter } from './labelSelectorParser';
import { ParsedQs } from 'qs';

type ValueOf<T> = T[keyof T];
type QueryValue = ValueOf<ParsedQs>;

const validateKubernetesQueryParams = (queryParams: ParsedQs) => {
  const { kubernetesId } = queryParams;
  if (!kubernetesId) {
    throw new Error('Missing query parameter "kubernetesId"');
  }
};

const queryValidators: Record<
  string,
  (queryParams: ParsedQs) => void | undefined
> = {
  'kubernetes-deployments': validateKubernetesQueryParams,
};

/**
 * Validates if all required query params are set for a specific query.
 * Throws an error if some are missing
 * @param queryParams
 * @param queryId
 */
export const validateQueryParameters = (
  queryParams: ParsedQs,
  queryId: string,
): void => {
  queryValidators[queryId]?.(queryParams);
};

export const generateComplexFilter = (
  kubernetesId: QueryValue,
  labelSelector: QueryValue,
  namespace: QueryValue,
) => {
  const filters: string[] = [];
  if (kubernetesId && typeof kubernetesId === 'string') {
    filters.push(
      `| filter workload.labels[\`backstage.io/kubernetes-id\`] == "${kubernetesId}"`, // component annotation "backstage.io/kubernetes-id"
    );
  }
  if (labelSelector && typeof labelSelector === 'string') {
    filters.push(generateKubernetesSelectorFilter(labelSelector)); // component annotation "backstage.io/kubernetes-label-selector"
  }
  if (namespace && typeof namespace === 'string') {
    filters.push(`| filter Namespace == "${namespace}"`); // component annotation "backstage.io/kubernetes-namespace" || component.metadata.namespace || 'default'
  }
  return filters.join('\n');
};
