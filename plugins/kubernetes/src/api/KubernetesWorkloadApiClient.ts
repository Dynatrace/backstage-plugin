import { KubernetesWorkloadApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

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

  async getDeployments(component: string): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'dynatrace-kubernetes',
    )}/deployments?component=${encodeURIComponent(component)}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return response.json();
  }
}
