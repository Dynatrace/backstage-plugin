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
import { ParsedQs } from 'qs';

const validateKubernetesQueryParams = (queryParams: ParsedQs) => {
  const { kubernetesId, labelSelector } = queryParams;
  if (!kubernetesId && !labelSelector) {
    throw new Error(
      'One of the query parameters is required: "kubernetesId" or "labelSelector"',
    );
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
