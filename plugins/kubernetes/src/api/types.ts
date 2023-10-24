import { createApiRef } from '@backstage/core-plugin-api';
import { TabularData } from '@dynatrace/backstage-plugin-kubernetes-common';

export interface DqlQueryApi {
  getData(component: string): Promise<TabularData>;
}

export const dqlQueryApiRef = createApiRef<DqlQueryApi>({
  id: 'plugin.dynatrace-dql.service',
});
