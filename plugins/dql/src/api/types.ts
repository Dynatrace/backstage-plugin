import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export type DqlQueryApi = {
  getData(
    namespace: string,
    queryName: string,
    component: string,
  ): Promise<TabularData>;
};
