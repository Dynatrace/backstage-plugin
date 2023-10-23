import { createApiRef } from '@backstage/core-plugin-api';
import { Deployment } from '@dynatrace/backstage-plugin-kubernetes-common';

export interface KubernetesWorkloadApi {
  getHealth(): Promise<{ status: string }>;
  getDeployments(component: string): Promise<Deployment[]>;
}

export const kubernetesWorkloadApiRef = createApiRef<KubernetesWorkloadApi>({
  id: 'plugin.dynatrace-kubernetes.service',
});
