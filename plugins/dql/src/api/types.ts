import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export interface DqlQueryApi {
  getData(
    namespace: string,
    queryName: string,
    component: string,
  ): Promise<TabularData>;
}
