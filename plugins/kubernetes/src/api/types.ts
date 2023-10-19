import { createApiRef } from '@backstage/core-plugin-api';

export interface KubernetesWorkloadApi {
  getHealth(): Promise<{ status: string }>;
}

export const kubernetesWorkloadApiRef = createApiRef<KubernetesWorkloadApi>({
  id: 'plugin.dynatrace-kubernetes.service',
});
