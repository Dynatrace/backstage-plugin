import { DiscoveryApi } from '@backstage/core-plugin-api';
import { User } from '../types';
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
  async getData(): Promise<User[]> {
    // const url = `${await this.discoveryApi.getBaseUrl('dynatrace-kubernetes')}/workload...`;
    return [
      {
        gender: 'female',
        name: {
          title: 'Miss',
          first: 'Carolyn',
          last: 'Moore',
        },
        email: 'carolyn.moore@example.com',
        picture: 'https://api.dicebear.com/6.x/open-peeps/svg?seed=Carolyn',
        nat: 'GB',
      },
    ];
  }
}
