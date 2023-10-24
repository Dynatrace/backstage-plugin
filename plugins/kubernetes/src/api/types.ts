import { createApiRef } from '@backstage/core-plugin-api';
import { TabularData } from '@dynatrace/backstage-plugin-kubernetes-common';

export interface KubernetesWorkloadApi {
  getData(component: string): Promise<TabularData>;
}

export const kubernetesWorkloadApiRef = createApiRef<KubernetesWorkloadApi>({
  id: 'plugin.dynatrace-kubernetes.service',
});
