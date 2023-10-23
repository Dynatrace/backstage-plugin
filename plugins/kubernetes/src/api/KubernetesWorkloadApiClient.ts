import { DiscoveryApi } from '@backstage/core-plugin-api';
import { Deployment } from '@dynatrace/backstage-plugin-kubernetes-common';
import { exampleData } from '../../dev/data';
import { KubernetesWorkloadApi } from './types';

export class KubernetesWorkloadApiClient implements KubernetesWorkloadApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  async getHealth(): Promise<{ status: string }> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'dynatrace-kubernetes',
    )}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return response.json();
  }
  async getData(): Promise<Deployment[]> {
    // const url = `${await this.discoveryApi.getBaseUrl('dynatrace-kubernetes')}/workload...`;
    return exampleData;
  }
}
