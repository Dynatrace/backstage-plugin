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

  async getData(component: string): Promise<TabularData> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'dynatrace-dql',
    )}/dynatrace/kubernetes-deployments?component=${encodeURIComponent(
      component,
    )}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return TabularDataFactory.fromObject(await response.json());
  }
}
