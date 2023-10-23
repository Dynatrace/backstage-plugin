import { createApiRef } from '@backstage/core-plugin-api';
import { User } from '@dynatrace/backstage-plugin-kubernetes-common';

export interface KubernetesWorkloadApi {
  getHealth(): Promise<{ status: string }>;
  getData(): Promise<User[]>;
}

export const kubernetesWorkloadApiRef = createApiRef<KubernetesWorkloadApi>({
  id: 'plugin.dynatrace-kubernetes.service',
});
