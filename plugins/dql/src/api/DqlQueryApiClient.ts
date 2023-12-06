import { DqlQueryApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
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
  ): Promise<TabularData> {
    const baseUrl = await this.discoveryApi.getBaseUrl('dynatrace-dql');
    const encodedComponentName = encodeURIComponent(componentName);
    const encodedComponentNamespace = encodeURIComponent(componentNamespace);
    const url = `${baseUrl}/${queryNamespace}/${queryName}?componentName=${encodedComponentName}&componentNamespace=${encodedComponentNamespace}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.status === 404) {
      throw new Error(`Query ${queryNamespace}/${queryName} does not exist.`);
    } else if (response.status !== 200) {
      let error: Error;
      try {
        const jsonResponse = await response.json();
        error = {
          name: 'Received a server error',
          message: JSON.stringify(jsonResponse),
        } as Error;
      } catch (e) {
        error = new Error(
          `Failed to fetch DQL query data from ${url}: ${response.status} ${response.statusText}`,
        );
      }
      throw error;
    }

    const jsonResponse = await response.json();
    return TabularDataFactory.fromObject(jsonResponse);
  }
}
