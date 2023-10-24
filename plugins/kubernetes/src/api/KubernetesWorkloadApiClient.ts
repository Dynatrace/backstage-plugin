import { KubernetesWorkloadApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import {
  TabularData,
  TabularDataFactory,
} from '@dynatrace/backstage-plugin-kubernetes-common';

export class KubernetesWorkloadApiClient implements KubernetesWorkloadApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  async getData(component: string): Promise<TabularData> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'dynatrace-kubernetes',
    )}/deployments?component=${encodeURIComponent(component)}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return TabularDataFactory.fromObject(await response.json());
  }
}
