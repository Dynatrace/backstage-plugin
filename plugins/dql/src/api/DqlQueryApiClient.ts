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
import { DqlQueryApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  TabularData,
  TabularDataFactory,
} from '@dynatrace/backstage-plugin-dql-common';

export class DqlQueryApiClient implements DqlQueryApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  async getData(
    queryNamespace: string,
    queryName: string,
    componentName: string,
    componentNamespace: string,
    kubernetesId?: string,
    labelSelector?: string,
  ): Promise<TabularData> {
    const baseUrl = await this.discoveryApi.getBaseUrl('dynatrace-dql');
    const searchParams = new URLSearchParams({
      componentName,
      componentNamespace,
      ...(labelSelector && { labelSelector }),
      ...(kubernetesId && { kubernetesId }),
    });
    const url = `${baseUrl}/${queryNamespace}/${queryName}?${searchParams}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.status === 404) {
      throw new Error(`Query ${queryNamespace}/${queryName} does not exist.`);
    } else if (response.status !== 200) {
      throw await ResponseError.fromResponse(response);
    }

    const jsonResponse = await response.json();
    return TabularDataFactory.fromObject(jsonResponse);
  }
}
